import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  GraduationCap,
  Briefcase,
  Tags,
  ThumbsUp,
  ThumbsDown,
  Users,
  MessageSquare,
} from 'lucide-react';
import type { ScreeningResult } from '../lib/screening';
import ScoreRing from './ScoreRing';

const recommendationStyles: Record<
  ScreeningResult['recommendation'],
  { bg: string; text: string; border: string }
> = {
  'Strong Hire': {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    border: 'border-emerald-400/30',
  },
  Interview: {
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-300',
    border: 'border-cyan-400/30',
  },
  Maybe: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-400/30',
  },
  Pass: {
    bg: 'bg-rose-500/15',
    text: 'text-rose-300',
    border: 'border-rose-400/30',
  },
};

interface ResultsPanelProps {
  result: ScreeningResult;
}

export default function ResultsPanel({ result }: ResultsPanelProps) {
  const rec = recommendationStyles[result.recommendation];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-6"
    >
      <div className="glass glow-ring rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
          <ScoreRing score={result.overallScore} />

          <div className="flex-1 text-center lg:text-left">
            <div className="mb-3 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                {result.candidateName}
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${rec.bg} ${rec.text} ${rec.border}`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {result.recommendation}
              </span>
            </div>
            <p className="max-w-2xl text-slate-300 leading-relaxed">{result.summary}</p>

            <div className="mt-5 flex flex-wrap justify-center gap-3 lg:justify-start">
              {result.educationLevel && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-300">
                  <GraduationCap className="h-4 w-4 text-accent-400" />
                  {result.educationLevel}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-300">
                <Tags className="h-4 w-4 text-brand-300" />
                {result.skills.filter((s) => s.matched).length}/{result.skills.length} skills
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-300">
                <Users className="h-4 w-4 text-cyan-300" />
                Culture {result.cultureFitScore}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-300">
                <MessageSquare className="h-4 w-4 text-violet-300" />
                Communication {result.communicationScore}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {result.categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className="glass rounded-xl p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {cat.name}
              </span>
              <span className="font-display text-lg font-bold text-white">{cat.score}</span>
            </div>
            <div className="mb-2 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-400"
                initial={{ width: 0 }}
                animate={{ width: `${cat.score}%` }}
                transition={{ duration: 0.9, delay: 0.2 + i * 0.06 }}
              />
            </div>
            <p className="text-xs text-slate-500 leading-snug">{cat.details}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 font-display text-lg font-semibold text-white">Skill Match</h3>
          <div className="flex flex-wrap gap-2">
            {result.skills.map((skill) => (
              <span
                key={skill.skill}
                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium capitalize ${
                  skill.matched
                    ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-rose-400/20 bg-rose-500/10 text-rose-300/80'
                }`}
              >
                {skill.matched ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <AlertTriangle className="h-3 w-3" />
                )}
                {skill.skill}
              </span>
            ))}
            {result.skills.length === 0 && (
              <p className="text-sm text-slate-500">No discrete skills extracted from the job description.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-white">
              <ThumbsUp className="h-5 w-5 text-emerald-400" />
              Strengths
            </h3>
            <ul className="space-y-2">
              {result.strengths.map((s) => (
                <li key={s} className="flex gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {s}
                </li>
              ))}
              {result.strengths.length === 0 && (
                <li className="text-sm text-slate-500">No standout strengths detected.</li>
              )}
            </ul>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-white">
              <ThumbsDown className="h-5 w-5 text-amber-400" />
              Concerns
            </h3>
            <ul className="space-y-2">
              {result.concerns.map((c) => (
                <li key={c} className="flex gap-2 text-sm text-slate-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  {c}
                </li>
              ))}
              {result.concerns.length === 0 && (
                <li className="text-sm text-slate-500">No major concerns flagged.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-3 font-display text-lg font-semibold text-white">Matched Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {result.matchedKeywords.map((k) => (
              <span key={k} className="rounded-md bg-brand-500/15 px-2 py-1 text-xs text-brand-200">
                {k}
              </span>
            ))}
            {result.matchedKeywords.length === 0 && (
              <p className="text-sm text-slate-500">No keyword overlaps found.</p>
            )}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-3 font-display text-lg font-semibold text-white">Missing Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {result.missingKeywords.map((k) => (
              <span key={k} className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-400">
                {k}
              </span>
            ))}
            {result.missingKeywords.length === 0 && (
              <p className="text-sm text-slate-500">All key terms appear to be covered.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
