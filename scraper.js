// ─────────────────────────────────────────────────────────
// scraper.js — Fetches RSS + scrapes HTML, deduplicates, sends to AI
// ─────────────────────────────────────────────────────────
const Parser = require('rss-parser');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const crypto = require('crypto');
const config = require('./config');
const db = require('./db');
const summarizer = require('./summarizer');

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'NeutralNews/1.0 (RSS Reader)' },
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
      ['enclosure', 'enclosure', { keepArray: false }],
    ],
  },
});

// ── Extract the best available image URL from an RSS item ──
function extractImageUrl(item) {
  // 1. media:content (most common in CBC, BBC, Reuters)
  if (item.mediaContent) {
    const mc = item.mediaContent;
    const url = mc.$ && mc.$.url ? mc.$.url : (typeof mc === 'string' ? mc : null);
    if (url && url.match(/\.(jpg|jpeg|png|webp)/i)) return url;
  }
  // 2. media:thumbnail
  if (item.mediaThumbnail) {
    const mt = item.mediaThumbnail;
    const url = mt.$ && mt.$.url ? mt.$.url : (typeof mt === 'string' ? mt : null);
    if (url) return url;
  }
  // 3. enclosure (podcasts also use this but image types are fine)
  if (item.enclosure) {
    const enc = item.enclosure;
    const url = enc.url || (enc.$ && enc.$.url);
    if (url && (enc.type || '').startsWith('image')) return url;
  }
  // 4. First <img> tag in content/description HTML
  if (item.content || item.description) {
    const html = item.content || item.description || '';
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1] && !match[1].includes('pixel') && !match[1].includes('tracker')) {
      return match[1];
    }
  }
  return null;
}

// ── Fingerprint: normalized hash of title for dedup ──
function makeFingerprint(title) {
  const normalized = (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 32);
}

// ── Simple HTTP GET that follows redirects ──
function httpGet(url, maxRedirects = 3) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: { 'User-Agent': config.scrapeDefaults.userAgent },
      timeout: config.scrapeDefaults.timeout,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (maxRedirects <= 0) return reject(new Error('Too many redirects'));
        return resolve(httpGet(res.headers.location, maxRedirects - 1));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ── Fetch a single RSS feed ──
async function fetchRssFeed(source) {
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items || []).map(item => ({
      title: (item.title || '').trim(),
      link: item.link || '',
      description: (item.contentSnippet || item.content || item.description || '').trim(),
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      sourceName: source.name,
      sourceUrl: source.url,
      imageUrl: extractImageUrl(item),
    }));
  } catch (err) {
    console.warn(`  [WARN] RSS failed for ${source.name}: ${err.message}`);
    return [];
  }
}

// ── Scrape an HTML page for headlines ──
async function scrapeHtmlPage(source) {
  try {
    const html = await httpGet(source.url);
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const sel = source.selectors || {};

    const containers = doc.querySelectorAll(sel.container || 'article');
    const items = [];

    containers.forEach((el, i) => {
      if (i >= (config.scrapeDefaults.maxItems || 20)) return;

      let titleEl = sel.title ? el.querySelector(sel.title) : el.querySelector('h2, h3, .headline');
      let linkEl = sel.link ? el.querySelector(sel.link) : el.querySelector('a');

      const title = (titleEl ? titleEl.textContent : '').trim();
      let link = linkEl ? (linkEl.getAttribute('href') || '') : '';

      if (!title) return;

      // Resolve relative URLs
      if (link && !link.startsWith('http')) {
        const base = sel.baseUrl || new URL(source.url).origin;
        link = base + (link.startsWith('/') ? '' : '/') + link;
      }

      items.push({
        title,
        link,
        description: title, // HTML scrape: description = title (AI will work with what's available)
        pubDate: new Date().toISOString(),
        sourceName: source.name,
        sourceUrl: link || source.url,
      });
    });

    return items;
  } catch (err) {
    console.warn(`  [WARN] HTML scrape failed for ${source.name}: ${err.message}`);
    return [];
  }
}

// ── Fetch a source (auto-detects RSS vs scrape) ──
async function fetchSource(source) {
  if (source.type === 'scrape') {
    return scrapeHtmlPage(source);
  }
  // Default: RSS, but if RSS fails and source has selectors, try HTML scrape
  const rssItems = await fetchRssFeed(source);
  if (rssItems.length > 0) return rssItems;

  if (source.selectors) {
    console.log(`    Falling back to HTML scrape for ${source.name}...`);
    return scrapeHtmlPage(source);
  }
  return [];
}

// fetchCategory is superseded by buildActiveFeeds + fetchFeed, kept for compatibility
async function fetchCategory(categoryKey) {
  const activeFeeds = buildActiveFeeds();
  const feed = activeFeeds.find(f => f.key === categoryKey);
  if (!feed) return [];
  return fetchFeed(feed);
}

// ── Group similar stories across sources ──
function groupSimilarStories(items) {
  const groups = [];
  const used = new Set();

  for (let i = 0; i < items.length; i++) {
    if (used.has(i)) continue;

    const group = [items[i]];
    used.add(i);

    const wordsA = new Set(
      items[i].title.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 3)
    );

    for (let j = i + 1; j < items.length; j++) {
      if (used.has(j)) continue;

      const wordsB = new Set(
        items[j].title.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 3)
      );

      // Jaccard similarity on significant title words
      const intersection = [...wordsA].filter(w => wordsB.has(w)).length;
      const union = new Set([...wordsA, ...wordsB]).size;
      const similarity = union > 0 ? intersection / union : 0;

      if (similarity > 0.35) {
        group.push(items[j]);
        used.add(j);
        if (group.length >= 3) break; // Max 3 sources per story
      }
    }

    groups.push(group);
  }

  return groups;
}

// ── Build active feed list from user settings ─────────────
function buildActiveFeeds() {
  const lib = config.sourceLibrary;
  let userSettings = null;
  try {
    const p = path.join(__dirname, 'data', 'user-settings.json');
    if (fs.existsSync(p)) userSettings = JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {}

  const isEnabled = (section, id) => {
    if (!userSettings) {
      // No saved settings — use defaults from library
      const item = lib[section] && lib[section].find(x => x.id === id);
      return item ? item.defaultEnabled : false;
    }
    const list = userSettings[section] || [];
    return list.includes(id);
  };

  const feeds = [];

  // Cities → each enabled city becomes its own category
  for (const city of lib.cities) {
    if (isEnabled('cities', city.id)) {
      feeds.push({ key: city.id, label: city.label, sources: city.sources });
    }
  }

  // Canada national — always included (uses CBC, CTV, Globe national feeds)
  feeds.push({
    key: 'canada',
    label: 'Canada',
    sources: [
      { name: 'CBC News',       url: 'https://www.cbc.ca/cmlink/rss-topstories', type: 'rss' },
      { name: 'CTV News',       url: 'https://www.ctvnews.ca/rss/ctvnews-ca-top-stories-public-rss-1.822009', type: 'rss' },
      { name: 'Globe and Mail', url: 'https://www.theglobeandmail.com/arc/outboundfeeds/rss/category/canada/', type: 'rss' },
      { name: 'National Post',  url: 'https://nationalpost.com/feed', type: 'rss' },
      { name: 'Global News CA', url: 'https://globalnews.ca/feed/', type: 'rss' },
    ],
  });

  // International → pool ALL enabled regions into one category so stories
  // cross-reference each other (e.g. Reuters vs Al Jazeera on the same event)
  const intlSources = [];
  for (const region of lib.international) {
    if (isEnabled('international', region.id)) {
      intlSources.push(...region.sources);
    }
  }
  if (intlSources.length > 0) {
    feeds.push({ key: 'international', label: 'International', sources: intlSources });
  }

  // Health influencers → pool ALL enabled influencers into one category
  const healthSources = [];
  for (const inf of lib.influencers) {
    if (isEnabled('influencers', inf.id)) {
      healthSources.push(...inf.sources);
    }
  }
  if (healthSources.length > 0) {
    feeds.push({ key: 'health', label: 'Health & Science', sources: healthSources });
  }

  return feeds;
}

// ── Fetch all items for a feed entry ─────────────────────
async function fetchFeed(feedEntry) {
  let allItems = [];
  for (const source of feedEntry.sources) {
    const items = await fetchSource(source);
    allItems = allItems.concat(items);
  }
  return allItems;
}

// ── Main scrape function ──────────────────────────────────
async function scrapeAll() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const timestamp = now.toISOString();

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`SCRAPE STARTED — ${timestamp}`);
  console.log(`${'═'.repeat(60)}`);

  const activeFeeds = buildActiveFeeds();
  console.log(`Active feeds: ${activeFeeds.map(f => f.label).join(', ')}`);
  let totalNew = 0;

  for (const feedEntry of activeFeeds) {
    const categoryKey = feedEntry.key;
    const catLabel = feedEntry.label;
    console.log(`\n── ${catLabel} ──`);

    // 1. Fetch raw items from all sources in this feed
    const rawItems = await fetchFeed(feedEntry);
    console.log(`  Fetched ${rawItems.length} raw items`);

    if (rawItems.length === 0) {
      console.log(`  [WARN] No items found for ${catLabel}. Skipping.`);
      continue;
    }

    // 2. Filter out items already in DB
    const newItems = rawItems.filter(item => {
      const fp = makeFingerprint(item.title);
      return !db.fingerprintExists(fp);
    });
    console.log(`  ${newItems.length} new items after dedup`);

    if (newItems.length === 0) {
      console.log(`  All stories already scraped. Skipping.`);
      continue;
    }

    // 3. Group similar stories (cross-reference sources)
    const groups = groupSimilarStories(newItems);
    console.log(`  ${groups.length} story groups formed`);

    // 4. Take top N groups
    const topGroups = groups.slice(0, config.maxStoriesPerCategory);

    // 5. Summarize each group with AI
    // Delay between calls to stay under Gemini free tier (15 req/min limit)
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    for (const group of topGroups) {
      try {
        const summary = await summarizer.summarizeStory(group, categoryKey);

        if (!summary) {
          console.log(`  [WARN] Empty summary for: ${group[0].title}`);
        } else {
          const fp = makeFingerprint(group[0].title);
          const sources = group.map(item => ({
            name: item.sourceName,
            url: item.link,
          }));

          // Use the first available image from any item in the group
          const imageUrl = group.map(i => i.imageUrl).find(u => !!u) || null;

          // Use the earliest publish date from the group (most authoritative)
          const pubDates = group
            .map(i => i.pubDate)
            .filter(Boolean)
            .map(d => new Date(d))
            .filter(d => !isNaN(d.getTime()));
          const pubDate = pubDates.length > 0
            ? new Date(Math.min(...pubDates.map(d => d.getTime()))).toISOString()
            : null;

          db.insertStory({
            category: categoryKey,
            headline: summary.headline,
            summary: summary.coreSummary,
            balanced_context: summary.balancedContext,
            closing_line: summary.closingLine,
            sources_json: JSON.stringify(sources),
            fingerprint: fp,
            scraped_at: timestamp,
            scrape_date: today,
            pub_date: pubDate,
            image_url: imageUrl,
          });

          totalNew++;
          console.log(`  ✓ ${summary.headline}`);
        }
      } catch (err) {
        console.error(`  [ERROR] Summarizing "${group[0].title}": ${err.message}`);
      }

      // Always wait 4.5s between calls — keeps us at ~13 req/min, safely
      // under the free tier limit of 15 req/min. Remove this once you add
      // Google billing, which raises the limit to 2,000 req/min.
      await delay(4500);
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`SCRAPE COMPLETE — ${totalNew} new stories added`);
  console.log(`${'═'.repeat(60)}\n`);

  return totalNew;
}

module.exports = { scrapeAll, fetchCategory, makeFingerprint };
