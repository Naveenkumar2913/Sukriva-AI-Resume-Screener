import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Cpu, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import type { ScreeningProgress as Progress } from '../lib/screening';

interface ScreeningProgressProps {
  progress: Progress;
}

export default function ScreeningProgressView({ progress }: ScreeningProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-5"
    >
      <div className="glass glow-ring rounded-2xl p-8 text-center lg:col-span-3">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/30 to-accent-500/20">
          <Cpu className="h-8 w-8 text-brand-300" />
        </div>

        <div className="mb-2 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-accent-400" />
          <h3 className="font-display text-xl font-semibold text-white">{progress.stage}</h3>
        </div>
        <p className="mb-6 text-sm text-slate-400">{progress.detail}</p>

        <div className="relative h-3 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-500 via-accent-400 to-brand-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress.progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ left: ['-20%', '120%'] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <p className="mt-3 font-display text-2xl font-bold tabular-nums text-white">
          {progress.progress}%
        </p>
        <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">Sukriva realtime analysis</p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/5 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Partial score</p>
            <p className="font-display text-lg font-bold text-accent-400 tabular-nums">
              {progress.partialScore ?? '—'}
            </p>
          </div>
          <div className="rounded-xl bg-white/5 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Skills found</p>
            <p className="font-display text-lg font-bold text-brand-300 tabular-nums">
              {progress.skillsFound}
            </p>
          </div>
          <div className="rounded-xl bg-white/5 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Keywords</p>
            <p className="font-display text-lg font-bold text-cyan-300 tabular-nums">
              {progress.keywordsFound}
            </p>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 lg:col-span-2">
        <div className="mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-accent-400" />
          <h4 className="text-sm font-semibold text-white">Live insights feed</h4>
        </div>
        <div className="scrollbar-thin max-h-80 space-y-2 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {progress.insights.length === 0 && (
              <p className="text-sm text-slate-500">Waiting for analysis signals…</p>
            )}
            {[...progress.insights].reverse().map((insight) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex gap-2 rounded-lg border px-3 py-2 text-xs leading-snug ${
                  insight.positive
                    ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
                    : 'border-amber-400/20 bg-amber-500/10 text-amber-200'
                }`}
              >
                {insight.positive ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                )}
                <span>{insight.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
