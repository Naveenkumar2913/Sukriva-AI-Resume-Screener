/**
 * Vercel Serverless Function — /api/analyzeResume
 * Calls Gemini when GEMINI_API_KEY is set.
 */
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

function extractJson(text) {
  if (!text || typeof text !== 'string') return null;
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function buildPrompt(resumeText, jobDescription) {
  const jdBlock = jobDescription?.trim()
    ? `\nTARGET JOB DESCRIPTION:\n"""\n${jobDescription.slice(0, 12000)}\n"""\n`
    : '\nNo specific job description provided. Evaluate general placement readiness for senior/tech/professional roles based on resume quality, skill density, and experience.\n';

  return `You are Sukriva, a senior technical recruiter and Placement Readiness Analyst.
Analyze the resume fairly and accurately. Do NOT be overly harsh. A strong resume with good skills, experience, and formatting should score 80-95+ and receive "Placement Ready" or "Strong Hire / Interview".

Return ONLY valid JSON (no markdown fences) with exactly this shape:
{
  "candidateName": "string",
  "atsScore": 0-100 integer,
  "grade": "A+|A|B+|B|C+|C|D|F",
  "overallRating": "Excellent|Strong|Good|Fair|Poor",
  "recommendation": "Strong Hire|Interview|Maybe|Pass",
  "resumeSummary": "2-4 sentence summary emphasizing candidate strengths and readiness",
  "placementStatus": "Placement Ready|Almost Ready|Needs Work",
  "placementScore": 0-100 integer,
  "placementSummary": "1-2 sentence placement readiness verdict",
  "skillsMatched": ["skill"],
  "missingSkills": ["skill"],
  "certifications": ["cert"],
  "jobRoles": [{ "title": "role", "matchScore": 0-100, "reason": "why" }],
  "categoryScores": {
    "skills": 0-100,
    "experience": 0-100,
    "education": 0-100,
    "keywords": 0-100,
    "impact": 0-100,
    "formatting": 0-100,
    "cultureFit": 0-100
  },
  "strengths": ["..."],
  "concerns": ["..."],
  "recommendations": ["actionable tips"],
  "experienceYears": null,
  "educationLevel": null,
  "keywordsMatched": ["..."],
  "keywordsMissing": ["..."]
}
${jdBlock}
RESUME TEXT:
"""
${resumeText.slice(0, 50000)}
"""`;
}

async function callModel(model, apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.35,
        topP: 0.9,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    }),
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server.',
      code: 'MISSING_API_KEY',
      fallback: true,
    });
  }

  const body = readBody(req);
  const resumeText = String(body.resumeText || '').trim();
  const jobDescription = String(body.jobDescription || '').trim();

  if (resumeText.length < 40) {
    return res.status(400).json({ error: 'Resume text is too short to analyze.' });
  }

  const prompt = buildPrompt(resumeText, jobDescription);
  let lastError = 'Gemini request failed';

  try {
    for (const model of MODELS) {
      const { response, data } = await callModel(model, apiKey, prompt);
      if (!response.ok) {
        lastError = data?.error?.message || `Gemini API error (${response.status}) for ${model}`;
        if (response.status === 404 || response.status === 400) continue;
        return res.status(response.status).json({ error: lastError, code: 'GEMINI_ERROR', fallback: true });
      }

      const text =
        data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
      const analysis = extractJson(text);
      if (!analysis || typeof analysis.atsScore !== 'number') {
        lastError = 'Unparseable model output';
        continue;
      }

      analysis.atsScore = Math.max(0, Math.min(100, Math.round(Number(analysis.atsScore))));
      if (!analysis.placementStatus) {
        if (analysis.atsScore >= 78) analysis.placementStatus = 'Placement Ready';
        else if (analysis.atsScore >= 62) analysis.placementStatus = 'Almost Ready';
        else analysis.placementStatus = 'Needs Work';
      }

      if (analysis.categoryScores && typeof analysis.categoryScores === 'object') {
        for (const key of Object.keys(analysis.categoryScores)) {
          const n = Number(analysis.categoryScores[key]);
          analysis.categoryScores[key] = Number.isFinite(n)
            ? Math.max(0, Math.min(100, Math.round(n)))
            : 0;
        }
      }

      return res.status(200).json({
        ok: true,
        provider: model,
        analysis,
        timestamp: Date.now(),
      });
    }

    return res.status(502).json({ error: lastError, code: 'BAD_MODEL_OUTPUT', fallback: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message || 'Failed to analyze resume with Gemini.',
      code: 'GEMINI_ERROR',
      fallback: true,
    });
  }
};
