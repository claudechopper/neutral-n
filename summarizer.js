// ─────────────────────────────────────────────────────────
// summarizer.js — Gemini REST API (v1, no SDK, no systemInstruction)
// ─────────────────────────────────────────────────────────
const https = require('https');
const config = require('./config');

// ── Direct HTTPS POST to Gemini REST API ──
function geminiRequest(apiKey, model, prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
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

  const prompt = `You are a neutral news summarizer. Produce ultra-concise, unbiased, factual summaries.

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
}

---

Category: ${categoryLabel}

${sourcesText}

Summarize the above into the JSON format. 40-75 words max total. Return only the JSON object.`;

  const response = await geminiRequest(apiKey, config.geminiModel, prompt);

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
