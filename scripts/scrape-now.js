#!/usr/bin/env node
// ─────────────────────────────────────────────────────────
// scrape-now.js — Run a one-off scrape from the command line
// Usage: npm run scrape
// ─────────────────────────────────────────────────────────
require('dotenv/config');
const { scrapeAll } = require('../scraper');

(async () => {
  try {
    const count = await scrapeAll();
    console.log(`Done. ${count} new stories added.`);
    process.exit(0);
  } catch (err) {
    console.error('Scrape failed:', err);
    process.exit(1);
  }
})();
