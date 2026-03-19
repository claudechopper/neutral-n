// ─────────────────────────────────────────────────────────
// scheduler.js — Cron-based scheduling for 3x daily scrapes
// ─────────────────────────────────────────────────────────
const cron = require('node-cron');
const config = require('./config');
const { scrapeAll } = require('./scraper');

let jobs = [];
let isRunning = false;

// ── Run a scrape with locking (prevent overlapping runs) ──
async function runScrape(label) {
  if (isRunning) {
    console.log(`[SCHEDULER] Skipping "${label}" — a scrape is already running.`);
    return;
  }
  isRunning = true;
  try {
    console.log(`[SCHEDULER] Triggered: ${label}`);
    await scrapeAll();
  } catch (err) {
    console.error(`[SCHEDULER] Error during "${label}": ${err.message}`);
  } finally {
    isRunning = false;
  }
}

// ── Start all scheduled cron jobs ──
function startScheduler() {
  const labels = ['6 AM', '11 AM', '6 PM'];

  config.schedules.forEach((cronExpr, i) => {
    const label = labels[i] || `Schedule #${i + 1}`;

    if (!cron.validate(cronExpr)) {
      console.error(`[SCHEDULER] Invalid cron: "${cronExpr}" for ${label}`);
      return;
    }

    const job = cron.schedule(cronExpr, () => runScrape(label), {
      timezone: config.timezone,
    });

    jobs.push(job);
    console.log(`[SCHEDULER] Registered: ${label} EST → ${cronExpr}`);
  });

  console.log(`[SCHEDULER] ${jobs.length} jobs active (timezone: ${config.timezone})`);
}

// ── Stop all jobs ──
function stopScheduler() {
  jobs.forEach(job => job.stop());
  jobs = [];
  console.log('[SCHEDULER] All jobs stopped.');
}

module.exports = { startScheduler, stopScheduler, runScrape };
