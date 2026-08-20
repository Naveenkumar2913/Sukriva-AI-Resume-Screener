import type { GeminiAnalysis } from './types';
import { analyzeResumeLocally, answerAdviserLocally } from './localAts';

export interface AnalyzeResponse {
  ok: boolean;
  provider?: string;
  analysis: GeminiAnalysis;
  timestamp: number;
  error?: string;
  code?: string;
  usedFallback?: boolean;
}

export interface AskAIResponse {
  ok: boolean;
  provider?: string;
  answer: string;
  timestamp: number;
  error?: string;
  code?: string;
  usedFallback?: boolean;
}

async function tryPost(path: string, body: unknown): Promise<Response | null> {
  try {
    return await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return null;
  }
}

/**
 * Analyze resume: tries serverless Gemini functions (/api/analyzeResume);
 * falls back to resume-grounded local ATS engine if serverless route or key is missing.
 */
export async function analyzeResumeApi(
  resumeText: string,
  jobDescription = ''
): Promise<AnalyzeResponse> {
  const paths = ['/api/analyzeResume', '/.netlify/functions/analyzeResume'];

  for (const path of paths) {
    const res = await tryPost(path, { resumeText, jobDescription });
    if (!res) continue;

    let data: Record<string, unknown> = {};
    try {
      data = (await res.json()) as Record<string, unknown>;
    } catch {
      data = {};
    }

    if (res.ok && data.analysis && typeof data.analysis === 'object') {
      return {
        ok: true,
        provider: typeof data.provider === 'string' ? data.provider : 'gemini',
        analysis: data.analysis as GeminiAnalysis,
        timestamp: typeof data.timestamp === 'number' ? data.timestamp : Date.now(),
      };
    }
  }

  // Local dynamic analysis based on resume content
  const analysis = analyzeResumeLocally(resumeText, jobDescription);
  return {
    ok: true,
    provider: 'sukriva-ats-engine',
    analysis,
    timestamp: Date.now(),
    usedFallback: true,
  };
}

/** AI Adviser with Gemini when available; otherwise resume-grounded local adviser */
export async function askAIApi(params: {
  question: string;
  resumeText: string;
  analysisContext?: Partial<GeminiAnalysis> | null;
  history?: Array<{ role: string; content: string }>;
}): Promise<AskAIResponse> {
  const paths = ['/api/askAI', '/.netlify/functions/askAI'];

  for (const path of paths) {
    const res = await tryPost(path, params);
    if (!res) continue;

    let data: Record<string, unknown> = {};
    try {
      data = (await res.json()) as Record<string, unknown>;
    } catch {
      data = {};
    }

    if (res.ok && typeof data.answer === 'string' && data.answer.trim()) {
      return {
        ok: true,
        provider: typeof data.provider === 'string' ? data.provider : 'gemini',
        answer: data.answer,
        timestamp: typeof data.timestamp === 'number' ? data.timestamp : Date.now(),
      };
    }
  }

  const analysis =
    (params.analysisContext as GeminiAnalysis | null) ||
    analyzeResumeLocally(params.resumeText);

  return {
    ok: true,
    provider: 'sukriva-ai-adviser',
    answer: answerAdviserLocally(params.question, params.resumeText, analysis),
    timestamp: Date.now(),
    usedFallback: true,
  };
}
