// ─────────────────────────────────────────────────────────
// scraper.js — Fetches RSS + scrapes HTML, deduplicates, sends to AI
// ─────────────────────────────────────────────────────────
const Parser = require('rss-parser');
const https = require('https');
const http = require('http');
const { JSDOM } = require('jsdom');
const crypto = require('crypto');
const config = require('./config');
const db = require('./db');
const summarizer = require('./summarizer');

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'NeutralNews/1.0 (RSS Reader)' },
});

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

// ── Fetch all sources for a category, with fallback ──
async function fetchCategory(categoryKey) {
  const catConfig = config.feeds[categoryKey];
  if (!catConfig) return [];

  let allItems = [];

  for (const source of catConfig.sources) {
    const items = await fetchSource(source);
    allItems = allItems.concat(items);
  }

  // If we got nothing, try fallbacks
  if (allItems.length === 0 && config.fallbackFeeds[categoryKey]) {
    console.log(`  [INFO] Primary sources empty for ${categoryKey}, trying fallbacks...`);
    for (const source of config.fallbackFeeds[categoryKey]) {
      const items = await fetchSource(source);
      allItems = allItems.concat(items);
    }
  }

  return allItems;
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

// ── Main scrape function ──────────────────────────────────
async function scrapeAll() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const timestamp = now.toISOString();

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`SCRAPE STARTED — ${timestamp}`);
  console.log(`${'═'.repeat(60)}`);

  const categories = Object.keys(config.feeds);
  let totalNew = 0;

  for (const categoryKey of categories) {
    const catLabel = config.feeds[categoryKey].label;
    console.log(`\n── ${catLabel} ──`);

    // 1. Fetch raw items from all sources
    const rawItems = await fetchCategory(categoryKey);
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
    for (const group of topGroups) {
      try {
        const summary = await summarizer.summarizeStory(group, categoryKey);

        if (!summary) {
          console.log(`  [WARN] Empty summary for: ${group[0].title}`);
          continue;
        }

        const fp = makeFingerprint(group[0].title);
        const sources = group.map(item => ({
          name: item.sourceName,
          url: item.link,
        }));

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
        });

        totalNew++;
        console.log(`  ✓ ${summary.headline}`);
      } catch (err) {
        console.error(`  [ERROR] Summarizing "${group[0].title}": ${err.message}`);
      }
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`SCRAPE COMPLETE — ${totalNew} new stories added`);
  console.log(`${'═'.repeat(60)}\n`);

  return totalNew;
}

module.exports = { scrapeAll, fetchCategory, makeFingerprint };
