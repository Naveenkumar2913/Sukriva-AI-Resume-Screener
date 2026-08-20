const { analyzeResumeLocally, answerAdviserLocally } = require('./_atsEngine');

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-flash-latest'];

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}

async function callGemini(model, apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.55, topP: 0.92, maxOutputTokens: 2048 },
    }),
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = readBody(req);
  const question = String(body.question || '').trim();
  const resumeText = String(body.resumeText || '').trim();
  const analysisContext = body.analysisContext || null;
  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];

  if (!question) return res.status(400).json({ error: 'Question is required.' });
  if (resumeText.length < 40) {
    return res.status(400).json({ error: 'Upload a resume before asking the AI Adviser.', code: 'NO_RESUME' });
  }

  const localAnalysis = analysisContext && analysisContext.atsScore != null
    ? analysisContext
    : analyzeResumeLocally(resumeText);
  const localAnswer = answerAdviserLocally(question, resumeText, localAnalysis);

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      ok: true,
      provider: 'sukriva-server-adviser',
      answer: localAnswer,
      timestamp: Date.now(),
      usedFallback: true,
    });
  }

  const historyBlock = history.map((h) => `${h.role === 'user' ? 'User' : 'Adviser'}: ${h.content}`).join('\n');
  const prompt = `You are Sukriva AI Adviser for engineering B.Tech students only (no other streams) for all degree categories (arts, commerce, science, engineering, medical, law, education, hospitality, etc.). Answer using ONLY the uploaded resume. Never invent facts. Use Markdown. Be specific to THIS candidate.

PRIOR ANALYSIS:
${JSON.stringify(localAnalysis).slice(0, 6000)}

RESUME:
"""
${resumeText.slice(0, 50000)}
"""
${historyBlock ? `CONVERSATION:\n${historyBlock}\n` : ''}
QUESTION: ${question}`;

  try {
    for (const model of MODELS) {
      const { response, data } = await callGemini(model, apiKey, prompt);
      if (!response.ok) {
        if (response.status === 404 || response.status === 400) continue;
        break;
      }
      const answer = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
      if (answer.trim()) {
        return res.status(200).json({
          ok: true,
          provider: model,
          answer: answer.trim(),
          timestamp: Date.now(),
        });
      }
    }
  } catch (err) {
    console.error('askAI', err);
  }

  return res.status(200).json({
    ok: true,
    provider: 'sukriva-server-adviser',
    answer: localAnswer,
    timestamp: Date.now(),
    usedFallback: true,
  });
};
