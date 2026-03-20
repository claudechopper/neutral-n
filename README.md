# Neutral News

Balanced, ultra-concise news summaries. No bias, no clickbait, no hooks.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up your Google API key
cp .env.example .env
# Edit .env and add your key from https://aistudio.google.com/app/apikey

# 3. Start the server
npm start

# 4. Open http://localhost:3000
```

The app opens with an empty page. Click **"Refresh feeds"** to trigger your first scrape, or wait for the next scheduled time.

## How It Works

- **3 daily scrapes** at 6 AM, 11 AM, 6 PM Eastern
- **4 categories**: Toronto, Canada, International, Dr. Rhonda Patrick (@foundmyfitness)
- **3 sources per category** (RSS feeds with HTML scrape fallback)
- Stories are deduplicated by title fingerprint — no repeats
- Each story is summarized by Google Gemini into 40–75 words: headline, core bullets, balanced context, closing line
- Sources are always linked

## Manual Scrape

```bash
npm run scrape
```

## Project Structure

```
news-app/
├── server.js          # Express server + API routes
├── scraper.js         # RSS + HTML scraping engine
├── summarizer.js      # Google Gemini API summarization
├── scheduler.js       # Cron scheduling (3x daily EST)
├── db.js              # SQLite storage + dedup
├── config.js          # All configuration (feeds, schedule, etc.)
├── public/
│   └── index.html     # Newspaper-style frontend
├── scripts/
│   └── scrape-now.js  # CLI one-off scrape
├── data/              # SQLite database (auto-created)
├── .env.example       # API key template
└── package.json
```

## Configuration

Edit `config.js` to change RSS feeds, add sources, adjust scrape times, or switch AI models.

## Notes

- **Twitter/X (@foundmyfitness)**: Uses Nitter RSS mirrors. These are community-run and may go down. If all fail, the app skips that category gracefully and logs a warning.
- **API costs**: Each story summary uses one Google Gemini API call (~400 tokens). At 15 stories × 4 categories × 3 scrapes = ~180 calls/day max. Actual usage is lower due to deduplication. Roughly $1.50–$4.50/month.
- **HTML scraping**: Used as fallback when RSS feeds fail. Configured per-source in `config.js` with CSS selectors.
# Force redeploy
