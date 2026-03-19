// ─────────────────────────────────────────────────────────
// config.js — Central configuration for Neutral News
// ─────────────────────────────────────────────────────────

module.exports = {
  // ── Anthropic Claude API ───────────────────────────────
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  anthropicModel: 'claude-haiku-4-5-20251001',

  // ── Server ─────────────────────────────────────────────
  port: parseInt(process.env.PORT, 10) || 3000,

  // ── Scrape schedule (cron expressions in America/Toronto tz) ──
  schedules: [
    '0 6 * * *',
    '0 11 * * *',
    '0 18 * * *',
  ],
  timezone: 'America/Toronto',

  // ── Max stories per category per scrape ────────────────
  maxStoriesPerCategory: 8,

  // ── HTML scraping defaults ─────────────────────────────
  scrapeDefaults: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    timeout: 20000,
    maxItems: 20,
  },

  // ──────────────────────────────────────────────────────
  // SOURCE LIBRARY
  // Every source the app knows about, organized by section.
  // Users pick which ones are active via the settings panel.
  // Each item has: id, label, default (bool), sources[]
  // ──────────────────────────────────────────────────────
  sourceLibrary: {

    // ── Canadian cities ──────────────────────────────────
    cities: [
      {
        id: 'toronto',
        label: 'Toronto',
        defaultEnabled: true,
        sources: [
          { name: 'CBC Toronto',      url: 'https://www.cbc.ca/cmlink/rss-canada-toronto', type: 'rss' },
          { name: 'CTV Toronto',      url: 'https://toronto.ctvnews.ca/rss/ctv-news-toronto-1.822319', type: 'rss' },
          { name: 'Toronto Star',     url: 'https://www.thestar.com/search/?f=rss&t=article&c=news/gta*&l=50&s=start_time&sd=desc', type: 'rss' },
          { name: 'Global News TO',   url: 'https://globalnews.ca/toronto/feed/', type: 'rss' },
          { name: 'CP24',             url: 'https://www.cp24.com/rss/', type: 'rss' },
        ],
      },
      {
        id: 'vancouver',
        label: 'Vancouver',
        defaultEnabled: false,
        sources: [
          { name: 'CBC Vancouver',       url: 'https://www.cbc.ca/cmlink/rss-canada-britishcolumbia', type: 'rss' },
          { name: 'Global News Vancouver',url: 'https://globalnews.ca/vancouver/feed/', type: 'rss' },
          { name: 'Vancouver Sun',       url: 'https://www.vancouversun.com/feed', type: 'rss' },
        ],
      },
      {
        id: 'montreal',
        label: 'Montreal',
        defaultEnabled: false,
        sources: [
          { name: 'CBC Montreal',     url: 'https://www.cbc.ca/cmlink/rss-canada-montreal', type: 'rss' },
          { name: 'CTV Montreal',     url: 'https://montreal.ctvnews.ca/rss/ctv-news-montreal-1.822323', type: 'rss' },
          { name: 'Montreal Gazette', url: 'https://montrealgazette.com/feed', type: 'rss' },
        ],
      },
      {
        id: 'calgary',
        label: 'Calgary',
        defaultEnabled: false,
        sources: [
          { name: 'CBC Calgary',    url: 'https://www.cbc.ca/cmlink/rss-canada-calgary', type: 'rss' },
          { name: 'Calgary Herald', url: 'https://calgaryherald.com/feed', type: 'rss' },
        ],
      },
      {
        id: 'ottawa',
        label: 'Ottawa',
        defaultEnabled: false,
        sources: [
          { name: 'CBC Ottawa',     url: 'https://www.cbc.ca/cmlink/rss-canada-ottawa', type: 'rss' },
          { name: 'Ottawa Citizen', url: 'https://ottawacitizen.com/feed', type: 'rss' },
        ],
      },
      {
        id: 'edmonton',
        label: 'Edmonton',
        defaultEnabled: false,
        sources: [
          { name: 'CBC Edmonton',     url: 'https://www.cbc.ca/cmlink/rss-canada-edmonton', type: 'rss' },
          { name: 'Edmonton Journal', url: 'https://edmontonjournal.com/feed', type: 'rss' },
        ],
      },
      {
        id: 'winnipeg',
        label: 'Winnipeg',
        defaultEnabled: false,
        sources: [
          { name: 'CBC Manitoba',    url: 'https://www.cbc.ca/cmlink/rss-canada-manitoba', type: 'rss' },
          { name: 'Winnipeg Free Press', url: 'https://www.winnipegfreepress.com/rss/', type: 'rss' },
        ],
      },
    ],

    // ── International regions ────────────────────────────
    international: [
      {
        id: 'global',
        label: 'Global Wire (Reuters · AP · BBC · Al Jazeera)',
        defaultEnabled: true,
        sources: [
          { name: 'Reuters',      url: 'https://feeds.reuters.com/reuters/topNews', type: 'rss' },
          { name: 'AP News',      url: 'https://rsshub.app/apnews/topics/apf-topnews', type: 'rss' },
          { name: 'BBC World',    url: 'https://feeds.bbci.co.uk/news/world/rss.xml', type: 'rss' },
          { name: 'Al Jazeera',   url: 'https://www.aljazeera.com/xml/rss/all.xml', type: 'rss' },
        ],
      },
      {
        id: 'usa',
        label: 'United States',
        defaultEnabled: false,
        sources: [
          { name: 'NPR News',   url: 'https://feeds.npr.org/1001/rss.xml', type: 'rss' },
          { name: 'PBS NewsHour', url: 'https://www.pbs.org/newshour/feeds/rss/headlines', type: 'rss' },
          { name: 'The Hill',   url: 'https://thehill.com/news/feed/', type: 'rss' },
        ],
      },
      {
        id: 'europe',
        label: 'Europe',
        defaultEnabled: false,
        sources: [
          { name: 'Deutsche Welle', url: 'https://rss.dw.com/rdf/rss-en-all', type: 'rss' },
          { name: 'France 24',      url: 'https://www.france24.com/en/rss', type: 'rss' },
          { name: 'Euronews',       url: 'https://feeds.feedburner.com/euronews/en/home', type: 'rss' },
        ],
      },
      {
        id: 'uk',
        label: 'United Kingdom',
        defaultEnabled: false,
        sources: [
          { name: 'BBC UK',         url: 'https://feeds.bbci.co.uk/news/uk/rss.xml', type: 'rss' },
          { name: 'The Guardian',   url: 'https://www.theguardian.com/uk-news/rss', type: 'rss' },
          { name: 'Sky News UK',    url: 'https://feeds.skynews.com/feeds/rss/uk.xml', type: 'rss' },
        ],
      },
      {
        id: 'middleeast',
        label: 'Middle East',
        defaultEnabled: false,
        sources: [
          { name: 'Al Jazeera',       url: 'https://www.aljazeera.com/xml/rss/all.xml', type: 'rss' },
          { name: 'Jerusalem Post',   url: 'https://www.jpost.com/Rss/RssFeedsHeadlines.aspx', type: 'rss' },
          { name: 'Arab News',        url: 'https://www.arabnews.com/rss.xml', type: 'rss' },
        ],
      },
      {
        id: 'asiapacific',
        label: 'Asia-Pacific',
        defaultEnabled: false,
        sources: [
          { name: 'ABC Australia', url: 'https://www.abc.net.au/news/feed/51120/rss.xml', type: 'rss' },
          { name: 'NHK World',     url: 'https://www3.nhk.or.jp/nhkworld/en/news/feeds/latest.xml', type: 'rss' },
          { name: 'SCMP',          url: 'https://www.scmp.com/rss/91/feed', type: 'rss' },
        ],
      },
      {
        id: 'africa',
        label: 'Africa',
        defaultEnabled: false,
        sources: [
          { name: 'AllAfrica',  url: 'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf', type: 'rss' },
          { name: 'Africa News', url: 'https://www.africanews.com/feed/rss', type: 'rss' },
        ],
      },
    ],

    // ── Health & Science influencers / publications ───────
    influencers: [
      {
        id: 'foundmyfitness',
        label: 'Dr. Rhonda Patrick — @foundmyfitness',
        defaultEnabled: true,
        sources: [
          { name: '@foundmyfitness', url: 'https://nitter.poast.org/foundmyfitness/rss', type: 'rss' },
          { name: '@foundmyfitness', url: 'https://nitter.privacydev.net/foundmyfitness/rss', type: 'rss' },
          { name: '@foundmyfitness', url: 'https://nitter.net/foundmyfitness/rss', type: 'rss' },
          { name: '@foundmyfitness', url: 'https://nitter.cz/foundmyfitness/rss', type: 'rss' },
          { name: 'FoundMyFitness Podcast', url: 'https://www.foundmyfitness.com/episodes/feed', type: 'rss' },
        ],
      },
      {
        id: 'peterattia',
        label: 'Dr. Peter Attia — @PeterAttiaMD',
        defaultEnabled: false,
        sources: [
          { name: '@PeterAttiaMD', url: 'https://nitter.poast.org/PeterAttiaMD/rss', type: 'rss' },
          { name: '@PeterAttiaMD', url: 'https://nitter.privacydev.net/PeterAttiaMD/rss', type: 'rss' },
          { name: 'Peter Attia Podcast', url: 'https://peterattiamd.com/feed/', type: 'rss' },
        ],
      },
      {
        id: 'huberman',
        label: 'Dr. Andrew Huberman — @hubermanlab',
        defaultEnabled: false,
        sources: [
          { name: '@hubermanlab', url: 'https://nitter.poast.org/hubermanlab/rss', type: 'rss' },
          { name: '@hubermanlab', url: 'https://nitter.privacydev.net/hubermanlab/rss', type: 'rss' },
          { name: 'Huberman Lab Podcast', url: 'https://feeds.megaphone.fm/hubermanlab', type: 'rss' },
        ],
      },
      {
        id: 'bryanjohnson',
        label: 'Bryan Johnson — @bryan_johnson',
        defaultEnabled: false,
        sources: [
          { name: '@bryan_johnson', url: 'https://nitter.poast.org/bryan_johnson/rss', type: 'rss' },
          { name: '@bryan_johnson', url: 'https://nitter.privacydev.net/bryan_johnson/rss', type: 'rss' },
        ],
      },
      {
        id: 'harvardhealth',
        label: 'Harvard Health Blog',
        defaultEnabled: false,
        sources: [
          { name: 'Harvard Health', url: 'https://feeds.health.harvard.edu/rss/blog-harvard-health', type: 'rss' },
        ],
      },
      {
        id: 'nih',
        label: 'NIH Health News',
        defaultEnabled: false,
        sources: [
          { name: 'NIH News', url: 'https://www.nih.gov/rss/news/nih-news.xml', type: 'rss' },
        ],
      },
      {
        id: 'examine',
        label: 'Examine.com — Nutrition Science',
        defaultEnabled: false,
        sources: [
          { name: 'Examine.com', url: 'https://examine.com/feed/', type: 'rss' },
        ],
      },
      {
        id: 'slatestar',
        label: 'Science Daily',
        defaultEnabled: false,
        sources: [
          { name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/health_medicine.xml', type: 'rss' },
        ],
      },
    ],
  },
};
