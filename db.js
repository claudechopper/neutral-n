// ─────────────────────────────────────────────────────────
// db.js — SQLite database for deduplication & story storage
// ─────────────────────────────────────────────────────────
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'news.db');

let db;

function getDb() {
  if (!db) {
    const fs = require('fs');
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    migrate(db);
  }
  return db;
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS stories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      headline TEXT NOT NULL,
      summary TEXT NOT NULL,
      balanced_context TEXT NOT NULL,
      closing_line TEXT NOT NULL,
      sources_json TEXT NOT NULL,        -- JSON array of {name, url}
      fingerprint TEXT NOT NULL UNIQUE,  -- dedup hash
      scraped_at TEXT NOT NULL,          -- ISO timestamp
      scrape_date TEXT NOT NULL,         -- YYYY-MM-DD for daily grouping
      image_url TEXT                     -- photo from RSS feed (nullable)
    );

    CREATE INDEX IF NOT EXISTS idx_stories_date_cat
      ON stories(scrape_date, category);

    CREATE INDEX IF NOT EXISTS idx_stories_fingerprint
      ON stories(fingerprint);
  `);

  // Add image_url column to existing databases that were created before this migration
  try {
    db.exec(`ALTER TABLE stories ADD COLUMN image_url TEXT;`);
  } catch (e) {
    // Column already exists — safe to ignore
  }
}

// ── Insert a new story (ignores duplicates via fingerprint) ──
function insertStory(story) {
  const stmt = getDb().prepare(`
    INSERT OR IGNORE INTO stories
      (category, headline, summary, balanced_context, closing_line, sources_json, fingerprint, scraped_at, scrape_date, image_url)
    VALUES
      (@category, @headline, @summary, @balanced_context, @closing_line, @sources_json, @fingerprint, @scraped_at, @scrape_date, @image_url)
  `);
  return stmt.run(story);
}

// ── Get stories for a given date, optionally filtered by category ──
function getStories(date, category) {
  const db = getDb();
  if (category && category !== 'all') {
    return db.prepare(
      'SELECT * FROM stories WHERE scrape_date = ? AND category = ? ORDER BY scraped_at DESC'
    ).all(date, category);
  }
  return db.prepare(
    'SELECT * FROM stories WHERE scrape_date = ? ORDER BY category, scraped_at DESC'
  ).all(date);
}

// ── Check if a fingerprint already exists (for dedup) ──
function fingerprintExists(fingerprint) {
  const row = getDb().prepare(
    'SELECT 1 FROM stories WHERE fingerprint = ?'
  ).get(fingerprint);
  return !!row;
}

// ── Get available dates (for archive browsing) ──
function getAvailableDates(limit = 30) {
  return getDb().prepare(
    'SELECT DISTINCT scrape_date FROM stories ORDER BY scrape_date DESC LIMIT ?'
  ).all(limit).map(r => r.scrape_date);
}

module.exports = { getDb, insertStory, getStories, fingerprintExists, getAvailableDates };
