// ─────────────────────────────────────────────────────────
// server.js — Express server for Neutral News
// ─────────────────────────────────────────────────────────
require('dotenv/config');
const express = require('express');
const path = require('path');
const config = require('./config');
const db = require('./db');
const { startScheduler } = require('./scheduler');
const { scrapeAll } = require('./scraper');
const { requireAuth } = require('./auth');

const app = express();

// ── Password protection (if APP_PASSWORD is set) ──
app.use(requireAuth);

// ── Serve static frontend ──
app.use(express.static(path.join(__dirname, 'public')));

// ── API: Get stories ──
app.get('/api/stories', (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const category = req.query.category || 'all';
    const stories = db.getStories(date, category);
    res.json({ date, category, stories, count: stories.length });
  } catch (err) {
    console.error('[API] Error fetching stories:', err.message);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// ── API: Get available dates ──
app.get('/api/dates', (req, res) => {
  try {
    const dates = db.getAvailableDates();
    res.json({ dates });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dates' });
  }
});

// ── API: Trigger manual scrape ──
app.post('/api/scrape', async (req, res) => {
  try {
    const newStories = await scrapeAll();
    res.json({ success: true, newStories });
  } catch (err) {
    console.error('[API] Scrape error:', err.message);
    res.status(500).json({ error: 'Scrape failed', message: err.message });
  }
});

// ── API: Health check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ── Start server ──
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════════╗`);
  console.log(`║       NEUTRAL NEWS — Server Running      ║`);
  console.log(`╠══════════════════════════════════════════╣`);
  console.log(`║  URL:  http://localhost:${PORT}             ║`);
  console.log(`║  API:  http://localhost:${PORT}/api/stories  ║`);
  console.log(`╚══════════════════════════════════════════╝\n`);

  // Start the cron scheduler
  startScheduler();

  // If no stories exist yet, offer to do an initial scrape
  const today = new Date().toISOString().split('T')[0];
  const existing = db.getStories(today, 'all');
  if (existing.length === 0) {
    console.log('[INFO] No stories for today. You can:');
    console.log('  1. Wait for the next scheduled scrape');
    console.log('  2. Click "Refresh feeds" in the web UI');
    console.log('  3. Run: npm run scrape');
  }
});
