// ─────────────────────────────────────────────────────────
// summarizer.js — Anthropic Claude API (direct HTTPS, no SDK)
// ─────────────────────────────────────────────────────────
const https = require('https');
const config = require('./config');

const SYSTEM_PROMPT = `You are a neutral news summarizer. Produce ultra-concise, unbiased, factual summaries.

RULES:
- 40 to 75 words maximum total (headline + bullets + context + closing combined)
- No opinions, no bias, no emotional language, no clickbait, no engagement hooks
- Never invent statistics or citations
- Frame things as "reported by" or "according to" — not as verified facts
- Tone: dry, matter-of-fact, human
- Return ONLY valid JSON — no markdown fences, no extra text

OUTPUT FORMAT (exactly these keys):
{
  "headline": "Clear, neutral, factual — one line, no clickbait",
  "coreSummary": "• What happened, key fact\\n• Additional key fact if needed",
  "balancedContext": "• One or two lines naturally reflecting multiple perspectives",
  "closingLine": "Single sentence: outcome, uncertainty, or what happens next. No engagement hook."
}`;

// ── Direct HTTPS POST to Anthropic Messages API ──
function claudeRequest(apiKey, model, systemPrompt, userMessage) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model,
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage },
      ],
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode !== 200) {
            const msg = parsed?.error?.message || JSON.stringify(parsed);
            reject(new Error(`HTTP ${res.statusCode}: ${msg}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Failed to parse Claude response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Claude request timed out'));
    });
    req.write(body);
    req.end();
  });
}

async function summarizeStory(storyGroup, categoryLabel) {
  const apiKey = config.anthropicApiKey;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not set. Add it to your Railway environment variables.');
  }

  const sourcesText = storyGroup
    .map((s, i) => `SOURCE ${i + 1}: ${s.sourceName}\nTitle: ${s.title}\nDescription: ${s.description}\nURL: ${s.link}`)
    .join('\n\n');

  const userMessage = `Category: ${categoryLabel}

${sourcesText}

Summarize the above. 40-75 words max total. Return only the JSON object.`;

  const response = await claudeRequest(
    apiKey,
    config.anthropicModel,
    SYSTEM_PROMPT,
    userMessage
  );

  // Extract text from Claude response structure
  const text = response?.content?.[0]?.text || '';
  if (!text) {
    throw new Error('Empty response from Claude');
  }

  // Strip markdown fences if present
  let jsonStr = text.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const parsed = JSON.parse(jsonStr);

  if (!parsed.headline || !parsed.coreSummary) {
    throw new Error('Missing required fields in Claude response');
  }

  return {
    headline: parsed.headline,
    coreSummary: parsed.coreSummary,
    balancedContext: parsed.balancedContext || '',
    closingLine: parsed.closingLine || '',
  };
}

module.exports = { summarizeStory };
