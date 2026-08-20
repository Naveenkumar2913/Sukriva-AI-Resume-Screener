import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  RotateCcw,
  Briefcase,
  Loader2,
  Sparkles,
  Download,
  FileJson,
} from 'lucide-react';
import ResumeUploader from '../components/ResumeUploader';
import AnalysisDashboard from '../components/AnalysisDashboard';
import AIAdviser from '../components/AIAdviser';
import { analyzeResumeApi } from '../lib/api';
import {
  buildReportText,
  downloadJsonFile,
  downloadTextFile,
} from '../lib/localAts';
import type { GeminiAnalysis } from '../lib/types';
import { useHistory } from '../hooks/useHistory';
import { useAuth } from '../context/AuthContext';

type Phase = 'idle' | 'analyzing' | 'done';

const SAMPLE_JD = `Senior Frontend Engineer — Product Platform

Requirements
- Proficiency in TypeScript, React, Next.js
- Tailwind CSS, design systems
- REST/GraphQL, testing (Jest/Cypress), CI/CD
- Performance and accessibility (WCAG)
- Bachelor's in CS or equivalent`;

export default function ScreenPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
  const [provider, setProvider] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [statusLine, setStatusLine] = useState('');
  const { addEntry } = useHistory();
  const { user } = useAuth();

  const canRun = resumeText.trim().length >= 40 && phase !== 'analyzing';

  const runAnalysis = async () => {
    if (!canRun) return;
    setError(null);
    setAnalysis(null);
    setPhase('analyzing');
    setStatusLine('Reading uploaded resume…');

    const stages = [
      'Extracted resume ready…',
      'Scoring skills, experience, and keywords…',
      'Building job recommendations…',
      'Finalizing ATS report…',
    ];
    let i = 0;
    const timer = window.setInterval(() => {
      setStatusLine(stages[Math.min(i, stages.length - 1)]);
      i += 1;
    }, 500);

    try {
      // Small delay so loading UI is visible even on fast local analysis
      await new Promise((r) => setTimeout(r, 600));
      const res = await analyzeResumeApi(resumeText, jobDescription);
      window.clearInterval(timer);

      if (!res.analysis) {
        throw new Error('No analysis returned. Try uploading again.');
      }

      setAnalysis(res.analysis);
      setProvider(res.provider || 'sukriva-local-ats');
      addEntry({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: res.timestamp || Date.now(),
        fileName: fileName || 'resume',
        resumeText,
        jobDescription,
        analysis: res.analysis,
        screenedBy: user?.name,
        provider: res.provider,
      });
      setPhase('done');
      setStatusLine('');
    } catch (err) {
      window.clearInterval(timer);
      const message =
        err instanceof Error ? err.message : 'Analysis failed unexpectedly.';
      setError(message);
      setPhase('idle');
      setStatusLine('');
    }
  };

  const reset = () => {
    setPhase('idle');
    setAnalysis(null);
    setProvider('');
    setError(null);
    setStatusLine('');
  };

  const clearResume = () => {
    setResumeText('');
    setFileName(null);
    reset();
  };

  const downloadReport = () => {
    if (!analysis) return;
    const safeName = (analysis.candidateName || 'candidate')
      .replace(/[^\w\-]+/g, '_')
      .slice(0, 40);
    downloadTextFile(
      buildReportText(analysis, fileName || undefined),
      `sukriva-ats-report-${safeName}.txt`
    );
  };

  const downloadJson = () => {
    if (!analysis) return;
    const safeName = (analysis.candidateName || 'candidate')
      .replace(/[^\w\-]+/g, '_')
      .slice(0, 40);
    downloadJsonFile(
      {
        provider,
        fileName,
        generatedAt: new Date().toISOString(),
        analysis,
      },
      `sukriva-ats-report-${safeName}.json`
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
          Resume Screening Workspace
        </h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Upload a PDF, DOCX, or TXT resume. Sukriva extracts the text and runs ATS analysis
          instantly — then you can download the full report.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'analyzing' ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass glow-ring mx-auto max-w-lg rounded-2xl p-10 text-center"
          >
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-accent-400" />
            <h3 className="mt-4 font-display text-xl font-semibold text-white">
              Analyzing your resume
            </h3>
            <p className="mt-2 text-sm text-slate-400">{statusLine}</p>
            <div className="mx-auto mt-6 h-2 max-w-xs overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-400"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '40%' }}
              />
            </div>
          </motion.div>
        ) : phase === 'done' && analysis ? (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-400">
                Analysis complete via {provider || 'Sukriva ATS'} · {new Date().toLocaleString()}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={downloadReport}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20"
                >
                  <Download className="h-4 w-4" />
                  Download report (.txt)
                </button>
                <button
                  type="button"
                  onClick={downloadJson}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                >
                  <FileJson className="h-4 w-4" />
                  Download JSON
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                >
                  <RotateCcw className="h-4 w-4" />
                  Screen another
                </button>
              </div>
            </div>

            <AnalysisDashboard analysis={analysis} fileName={fileName || undefined} />

            <AIAdviser resumeText={resumeText} analysis={analysis} />
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <ResumeUploader
              fileName={fileName}
              onExtracted={({ text, fileName: name }) => {
                setResumeText(text);
                setFileName(name);
                setError(null);
              }}
              onClear={clearResume}
            />

            <div className="glass rounded-2xl p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Briefcase className="h-4 w-4 text-brand-400" />
                  Target job description (optional)
                </label>
                <button
                  type="button"
                  onClick={() => setJobDescription(SAMPLE_JD)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-300 hover:underline"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Load sample JD
                </button>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8}
                placeholder="Paste a job description to improve ATS matching accuracy…"
                className="scrollbar-thin w-full resize-y rounded-xl border border-white/10 bg-surface-900/80 px-4 py-3 text-sm leading-relaxed text-slate-200 placeholder:text-slate-600 focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>

            {resumeText && (
              <details className="glass rounded-2xl p-4 text-sm text-slate-400">
                <summary className="cursor-pointer font-medium text-slate-300">
                  Preview extracted text ({resumeText.length} chars)
                </summary>
                <pre className="scrollbar-thin mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-black/30 p-3 text-xs text-slate-400">
                  {resumeText.slice(0, 4000)}
                  {resumeText.length > 4000 ? '…' : ''}
                </pre>
              </details>
            )}

            {error && (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={!canRun}
              onClick={() => void runAnalysis()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition enabled:hover:from-brand-400 enabled:hover:to-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Play className="h-4 w-4" />
              Run ATS analysis
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
