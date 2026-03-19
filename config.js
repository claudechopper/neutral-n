// ─────────────────────────────────────────────────────────
// config.js — Central configuration for Neutral News
// ─────────────────────────────────────────────────────────

module.exports = {
  // ── Google Gemini API ──────────────────────────────────
  geminiApiKey: process.env.GOOGLE_API_KEY || '',
  geminiModel: 'gemini-1.5-flash',

  // ── Server ─────────────────────────────────────────────
  port: parseInt(process.env.PORT, 10) || 3000,

  // ── Scrape schedule (cron expressions in America/Toronto tz) ──
  // 6 AM, 11 AM, 6 PM Eastern
  schedules: [
    '0 6 * * *',
    '0 11 * * *',
    '0 18 * * *',
  ],
  timezone: 'America/Toronto',

  // ── Max stories per category per scrape ────────────────
  maxStoriesPerCategory: 15,

  // ── News sources by category ───────────────────────────
  // Each source has: name, url, type ('rss' | 'scrape')
  // The scraper tries RSS first; if a source is type 'scrape',
  // it fetches the HTML and extracts headlines/links instead.
  feeds: {
    toronto: {
      label: 'Toronto',
      sources: [
        { name: 'CBC Toronto', url: 'https://www.cbc.ca/cmlink/rss-canada-toronto', type: 'rss' },
        { name: 'CTV Toronto', url: 'https://toronto.ctvnews.ca/rss/ctv-news-toronto-1.822319', type: 'rss' },
        { name: 'Toronto Star', url: 'https://www.thestar.com/search/?f=rss&t=article&c=news/gta*&l=50&s=start_time&sd=desc', type: 'rss' },
      ],
    },
    canada: {
      label: 'Canada',
      sources: [
        { name: 'CBC News', url: 'https://www.cbc.ca/cmlink/rss-topstories', type: 'rss' },
        { name: 'CTV News', url: 'https://www.ctvnews.ca/rss/ctvnews-ca-top-stories-public-rss-1.822009', type: 'rss' },
        { name: 'Globe and Mail', url: 'https://www.theglobeandmail.com/arc/outboundfeeds/rss/category/canada/', type: 'rss' },
      ],
    },
    international: {
      label: 'International',
      sources: [
        { name: 'Reuters', url: 'https://feeds.reuters.com/reuters/topNews', type: 'rss' },
        { name: 'AP News', url: 'https://rsshub.app/apnews/topics/apf-topnews', type: 'rss' },
        { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', type: 'rss' },
      ],
    },
    health: {
      label: 'Dr. Rhonda Patrick (@foundmyfitness)',
      sources: [
        // Nitter/RSS bridges for @foundmyfitness — community mirrors.
        // If all fail, the HTML scraper tries to pull from nitter directly.
        { name: '@foundmyfitness (nitter.net)', url: 'https://nitter.net/foundmyfitness/rss', type: 'rss' },
        { name: '@foundmyfitness (nitter.privacydev.net)', url: 'https://nitter.privacydev.net/foundmyfitness/rss', type: 'rss' },
        { name: '@foundmyfitness (nitter HTML)', url: 'https://nitter.net/foundmyfitness', type: 'scrape', selectors: {
          container: '.timeline-item',
          title: '.tweet-content',
          link: '.tweet-link',
          baseUrl: 'https://nitter.net',
        }},
      ],
    },
  },

  // ── Fallback sources (tried if all primary sources fail) ──
  fallbackFeeds: {
    toronto: [
      { name: 'Global News Toronto', url: 'https://globalnews.ca/toronto/feed/', type: 'rss' },
      { name: 'CP24', url: 'https://www.cp24.com', type: 'scrape', selectors: {
        container: 'article, .story-card, [class*="headline"]',
        title: 'h2, h3, .headline, a',
        link: 'a',
        baseUrl: 'https://www.cp24.com',
      }},
    ],
    canada: [
      { name: 'National Post', url: 'https://nationalpost.com/feed', type: 'rss' },
      { name: 'Global News Canada', url: 'https://globalnews.ca/feed/', type: 'rss' },
    ],
    international: [
      { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', type: 'rss' },
      { name: 'NPR World', url: 'https://feeds.npr.org/1004/rss.xml', type: 'rss' },
    ],
    health: [
      // Gracefully handled — app notes when Twitter feed is unavailable
    ],
  },

  // ── HTML scraping defaults ─────────────────────────────
  scrapeDefaults: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    timeout: 20000,
    maxItems: 20,
  },
};
