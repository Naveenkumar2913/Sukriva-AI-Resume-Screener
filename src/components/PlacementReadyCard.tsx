import { CheckCircle2, XCircle, GraduationCap, Target, Sparkles, Download } from 'lucide-react';
import type { GeminiAnalysis } from '../lib/types';
import { assessPlacementReadiness } from '../lib/placementReady';
import { buildReportText, downloadTextFile, downloadJsonFile } from '../lib/localAts';

interface Props {
  analysis: GeminiAnalysis;
  resumeText?: string;
  fileName?: string;
}

function statusStyles(status: string) {
  if (status === 'Placement Ready') {
    return 'border-emerald-400/40 bg-emerald-500/20 text-emerald-200 shadow-lg shadow-emerald-500/10';
  }
  if (status === 'Almost Ready') {
    return 'border-cyan-400/40 bg-cyan-500/20 text-cyan-200';
  }
  return 'border-amber-400/40 bg-amber-500/20 text-amber-200';
}

export default function PlacementReadyCard({ analysis, resumeText = '', fileName }: Props) {
  const assessment = assessPlacementReadiness(analysis, resumeText);

  const handleDownloadTxt = () => {
    const report = buildReportText(analysis, fileName);
    downloadTextFile(report, `${analysis.candidateName.replace(/\s+/g, '_')}_Sukriva_Placement_Report.txt`);
  };

  const handleDownloadJson = () => {
    downloadJsonFile(analysis, `${analysis.candidateName.replace(/\s+/g, '_')}_Sukriva_Report.json`);
  };

  return (
    <div className="glass glow-ring rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h3 className="font-display text-xl font-bold text-white">
              Placement Readiness Status
            </h3>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold uppercase tracking-wider ${statusStyles(assessment.status)}`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {assessment.status}
            </span>
          </div>

          <p className="max-w-3xl text-sm leading-relaxed text-slate-200">
            {assessment.summary}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
            >
              <Download className="h-3.5 w-3.5 text-brand-300" />
              Download Report (.txt)
            </button>
            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
            >
              <Download className="h-3.5 w-3.5 text-accent-400" />
              Export Data (.json)
            </button>
          </div>
        </div>

        <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-7 py-5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Readiness Score</p>
          <p className="font-display text-5xl font-extrabold tabular-nums text-emerald-400 my-1">
            {assessment.score}
          </p>
          <p className="text-xs font-medium text-slate-400">Out of 100</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {assessment.criteria.map((c) => (
          <div
            key={c.id}
            className={`flex gap-3 rounded-xl border px-3.5 py-3 ${
              c.passed
                ? 'border-emerald-400/25 bg-emerald-500/10 text-slate-200'
                : 'border-white/10 bg-white/[0.03] text-slate-300'
            }`}
          >
            {c.passed ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            )}
            <div>
              <p className="text-sm font-semibold text-white">
                {c.label}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{c.description}</p>
            </div>
          </div>
        ))}
      </div>

      {assessment.nextSteps.length > 0 && (
        <div className="mt-6 rounded-xl border border-brand-400/20 bg-brand-500/10 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-200">
            <Target className="h-4 w-4" />
            Placement Action Plan
          </p>
          <ul className="space-y-1.5">
            {assessment.nextSteps.map((step) => (
              <li key={step} className="text-sm text-slate-300">
                → {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
