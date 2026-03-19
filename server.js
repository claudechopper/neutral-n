// ─────────────────────────────────────────────────────────
// server.js — Express server for Neutral News
// ─────────────────────────────────────────────────────────
require('dotenv/config');
const express = require('express');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const db = require('./db');
const { startScheduler } = require('./scheduler');
const { scrapeAll } = require('./scraper');
const { requireAuth } = require('./auth');

// ── User settings helpers ──────────────────────────────────
const SETTINGS_PATH = path.join(__dirname, 'data', 'user-settings.json');

function loadUserSettings() {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
    }
  } catch (e) { console.warn('[Settings] Could not load user-settings.json:', e.message); }
  return null; // null = use defaults from sourceLibrary
}

function saveUserSettings(settings) {
  try {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
  } catch (e) { console.error('[Settings] Could not save user-settings.json:', e.message); }
}

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

// ── API: Trigger manual scrape (fire-and-forget) ──
// Returns immediately so the browser doesn't time out.
// The frontend polls /api/stories to pick up new stories as they arrive.
app.post('/api/scrape', (req, res) => {
  res.json({ success: true, message: 'Scrape started. Stories will appear as they are processed.' });
  // Run in background after response is sent
  scrapeAll().catch(err => console.error('[API] Scrape error:', err.message));
});

// ── API: Get source library + current user settings ──
app.get('/api/settings', (req, res) => {
  try {
    const userSettings = loadUserSettings();
    res.json({
      library: config.sourceLibrary,
      settings: userSettings, // null = use defaults
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

// ── API: Save user settings ──
app.post('/api/settings', express.json(), (req, res) => {
  try {
    const { storyCount, cities, international, influencers } = req.body;
    if (!cities || !international || !influencers) {
      return res.status(400).json({ error: 'Missing settings fields' });
    }
    saveUserSettings({ storyCount, cities, international, influencers });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save settings' });
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
