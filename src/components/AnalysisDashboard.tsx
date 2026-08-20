import { motion } from 'framer-motion';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Lightbulb,
  BadgeCheck,
} from 'lucide-react';
import type { GeminiAnalysis } from '../lib/types';
import ScoreRing from './ScoreRing';
import { CategoryRadarChart } from './Charts';
import PlacementReadyCard from './PlacementReadyCard';

interface AnalysisDashboardProps {
  analysis: GeminiAnalysis;
  fileName?: string;
  resumeText?: string;
}

function gradeColor(grade: string) {
  if (grade.startsWith('A')) return 'text-emerald-300 border-emerald-400/30 bg-emerald-500/15';
  if (grade.startsWith('B')) return 'text-cyan-300 border-cyan-400/30 bg-cyan-500/15';
  if (grade.startsWith('C')) return 'text-amber-300 border-amber-400/30 bg-amber-500/15';
  return 'text-rose-300 border-rose-400/30 bg-rose-500/15';
}

export default function AnalysisDashboard({ analysis, fileName, resumeText = '' }: AnalysisDashboardProps) {
  const cats = analysis.categoryScores || {
    skills: 0,
    experience: 0,
    education: 0,
    keywords: 0,
    impact: 0,
    formatting: 0,
    cultureFit: 0,
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass glow-ring rounded-2xl p-6 sm:p-8"
      >
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
          <ScoreRing score={analysis.atsScore} label="ATS Score" />
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-2 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                {analysis.candidateName || 'Candidate'}
              </h2>
              <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${gradeColor(analysis.grade || 'A')}`}>
                Grade {analysis.grade}
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-slate-300">
                {analysis.overallRating}
              </span>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-300">
                {analysis.recommendation}
              </span>
            </div>
            {fileName && <p className="mb-2 text-xs text-slate-500">Source: {fileName}</p>}
            <p className="max-w-3xl text-slate-300 leading-relaxed">{analysis.resumeSummary}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 lg:justify-start">
              {analysis.educationLevel && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-300">
                  <GraduationCap className="h-4 w-4 text-accent-400" />
                  {analysis.educationLevel}
                </span>
              )}
              {analysis.experienceYears != null && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-300">
                  {analysis.experienceYears}+ years experience
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-400/20 px-3 py-1.5 text-sm text-emerald-300 font-medium">
                Verified Placement Candidate
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <PlacementReadyCard analysis={analysis} resumeText={resumeText} fileName={fileName} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 font-display text-lg font-semibold text-white">Category Radar Score</h3>
          <CategoryRadarChart scores={cats} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(cats).map(([key, value]) => (
            <div key={key} className="glass rounded-xl p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {({ experience: 'Experience / Projects', cultureFit: 'Culture & Leadership' } as Record<string, string>)[key] || key.replace(/([A-Z])/g, ' $1')}
                </span>
                <span className="font-display text-lg font-bold text-white">{value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-400"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-white">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            Verified Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {(analysis.skillsMatched || []).map((s) => (
              <span key={s} className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 capitalize">
                {s}
              </span>
            ))}
            {!analysis.skillsMatched?.length && (
              <p className="text-sm text-slate-500">No skills parsed.</p>
            )}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-white">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            High-Value Skill Additions
          </h3>
          <div className="flex flex-wrap gap-2">
            {(analysis.missingSkills || []).map((s) => (
              <span key={s} className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200 capitalize">
                {s}
              </span>
            ))}
            {!analysis.missingSkills?.length && (
              <p className="text-sm text-emerald-300">All core skills present!</p>
            )}
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-white">
          <Award className="h-5 w-5 text-brand-300" />
          Recommended Job Role Alignments
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {(analysis.jobRoles || []).map((role) => (
            <div key={role.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h4 className="font-semibold text-white">{role.title}</h4>
                <span className="font-display text-lg font-bold text-accent-400">{role.matchScore}%</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">{role.reason}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-white">
            <BadgeCheck className="h-5 w-5 text-cyan-300" />
            Certifications & Training
          </h3>
          <ul className="space-y-2">
            {(analysis.certifications || []).length ? (
              analysis.certifications.map((c) => (
                <li key={c} className="text-sm text-slate-300">• {c}</li>
              ))
            ) : (
              <li className="text-sm text-slate-400">• Standard academic & self-directed technical training</li>
            )}
          </ul>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-white">
            <Lightbulb className="h-5 w-5 text-amber-300" />
            Actionable Optimization Tips
          </h3>
          <ul className="space-y-2">
            {(analysis.recommendations || []).map((r) => (
              <li key={r} className="flex gap-2 text-sm text-slate-300">
                <span className="text-brand-300">→</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-3 font-display text-lg font-semibold text-white">Candidate Strengths</h3>
          <ul className="space-y-2">
            {(analysis.strengths || []).map((s) => (
              <li key={s} className="flex gap-2 text-sm text-slate-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-3 font-display text-lg font-semibold text-white">Key Opportunities</h3>
          <ul className="space-y-2">
            {(analysis.concerns || []).map((c) => (
              <li key={c} className="flex gap-2 text-sm text-slate-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
