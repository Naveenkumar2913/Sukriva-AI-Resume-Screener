const { analyzeResumeLocally, answerAdviserLocally } = require('./_atsEngine');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch { body = {}; }
  const question = String(body.question || '').trim();
  const resumeText = String(body.resumeText || '').trim();
  if (!question) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Question is required.' }) };
  if (resumeText.length < 40) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Upload a resume first.', code: 'NO_RESUME' }) };

  const analysis = body.analysisContext && body.analysisContext.atsScore != null
    ? body.analysisContext
    : analyzeResumeLocally(resumeText);
  const localAnswer = answerAdviserLocally(question, resumeText, analysis);
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `Sukriva AI Adviser. Use ONLY this resume. Markdown answers.\nRESUME:\n${resumeText.slice(0, 50000)}\nQUESTION: ${question}` }] }],
          generationConfig: { temperature: 0.55, maxOutputTokens: 2048 },
        }),
      });
      const data = await response.json().catch(() => ({}));
      const answer = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
      if (response.ok && answer.trim()) {
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, provider: 'gemini-2.0-flash', answer: answer.trim(), timestamp: Date.now() }) };
      }
    } catch (e) { console.error(e); }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true, provider: 'sukriva-server-adviser', answer: localAnswer, timestamp: Date.now(), usedFallback: true }),
  };
};
