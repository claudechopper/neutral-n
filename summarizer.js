// ─────────────────────────────────────────────────────────
// summarizer.js — Gemini REST API (v1, no SDK dependency)
// ─────────────────────────────────────────────────────────
const https = require('https');
const config = require('./config');

const SYSTEM_PROMPT = `You are a neutral news summarizer. Your job is to produce ultra-concise, unbiased, factual summaries of news stories.

RULES — follow these exactly:
- 40 to 75 words maximum for the entire summary (headline + bullets + context + closing)
- No opinions, no bias, no emotional language, no clickbait
- No engagement hooks — the reader should feel informed and done
- Never invent statistics or citations
- Never state things as verified facts — frame as "reported by" or "according to"
- If the story is naturally ongoing, note what's next. If it's finite, end it cleanly.
- Tone: dry, matter-of-fact, human. Not robotic. Match the gravitas of the original story but strip any bias.
- If only one source is available, that's fine — the summary should still be neutral.

OUTPUT FORMAT — return ONLY valid JSON with these exact keys:
{
  "headline": "Clear, neutral, factual headline — one line, no clickbait",
  "coreSummary": "• Bullet point 1 — what happened, key fact\\n• Bullet point 2 — additional key fact (if needed)",
  "balancedContext": "• One or two bullet points naturally reflecting multiple perspectives without labeling sides",
  "closingLine": "Single sentence: outcome, uncertainty, or what's next. Feels complete, not engaging."
}

Do NOT add any text outside the JSON object. No markdown fences. Just the JSON.`;

// ── Direct HTTPS POST to Gemini REST API ──
function geminiRequest(apiKey, model, systemPrompt, userMessage) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.1,
      },
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1/models/${model}:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
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
          reject(new Error(`Failed to parse Gemini response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Gemini request timed out'));
    });
    req.write(body);
    req.end();
  });
}

async function summarizeStory(storyGroup, categoryKey) {
  const apiKey = config.geminiApiKey;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY not set. Add it to your Railway environment variables.');
  }

  const sourcesText = storyGroup
    .map((s, i) => `SOURCE ${i + 1}: ${s.sourceName}\nTitle: ${s.title}\nDescription: ${s.description}\nURL: ${s.link}`)
    .join('\n\n');

  const categoryLabel = config.feeds[categoryKey]?.label || categoryKey;

  const userMessage = `Category: ${categoryLabel}

Here are ${storyGroup.length} source(s) covering this story:

${sourcesText}

Summarize this into the required format. Remember: 40-75 words max total, neutral tone, no hooks. Return only valid JSON.`;

  const response = await geminiRequest(
    apiKey,
    config.geminiModel,
    SYSTEM_PROMPT,
    userMessage
  );

  const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  let jsonStr = text.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const parsed = JSON.parse(jsonStr);

  if (!parsed.headline || !parsed.coreSummary) {
    throw new Error('Missing required fields in Gemini response');
  }

  return {
    headline: parsed.headline,
    coreSummary: parsed.coreSummary,
    balancedContext: parsed.balancedContext || '',
    closingLine: parsed.closingLine || '',
  };
}

module.exports = { summarizeStory };
