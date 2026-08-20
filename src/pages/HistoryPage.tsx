import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { History, Trash2, ArrowRight, Inbox } from 'lucide-react';
import { useHistory } from '../hooks/useHistory';
import { AtsTrendChart } from '../components/Charts';

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 65) return 'text-cyan-400';
  if (score >= 45) return 'text-amber-400';
  return 'text-rose-400';
}

function recBadge(rec: string): string {
  if (rec === 'Strong Hire') return 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30';
  if (rec === 'Interview') return 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30';
  if (rec === 'Maybe') return 'bg-amber-500/15 text-amber-300 border-amber-400/30';
  return 'bg-rose-500/15 text-rose-300 border-rose-400/30';
}

export default function HistoryPage() {
  const { history, trend, clearHistory, removeEntry } = useHistory();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Screening History
          </h1>
          <p className="mt-2 text-slate-400">
            Gemini analyses stored locally in your browser.
          </p>
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            className="inline-flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear all
          </button>
        )}
      </div>

      {history.length > 0 && (
        <div className="glass mb-6 rounded-2xl p-5">
          <h2 className="mb-3 font-display text-sm font-semibold text-white">ATS trend chart</h2>
          <AtsTrendChart points={trend} />
        </div>
      )}

      {history.length === 0 ? (
        <div className="glass rounded-2xl px-6 py-16 text-center">
          <Inbox className="mx-auto h-10 w-10 text-slate-600" />
          <h2 className="mt-4 font-display text-xl font-semibold text-white">No screenings yet</h2>
          <p className="mt-2 text-sm text-slate-400">
            Upload a resume to run Gemini ATS analysis.
          </p>
          <Link
            to="/screen"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            Go to screening
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {history.map((entry, i) => (
            <motion.li
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5">
                  <History className="h-5 w-5 text-brand-300" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white">
                      {entry.analysis?.candidateName || 'Candidate'}
                    </h3>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${recBadge(entry.analysis?.recommendation || 'Pass')}`}
                    >
                      {entry.analysis?.recommendation}
                    </span>
                    {entry.analysis?.grade && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                        Grade {entry.analysis.grade}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-slate-400">{entry.fileName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(entry.timestamp).toLocaleString()}
                    {entry.screenedBy ? ` · by ${entry.screenedBy}` : ''}
                    {entry.provider ? ` · ${entry.provider}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:pl-4">
                <div className="text-right">
                  <p className={`font-display text-2xl font-bold tabular-nums ${scoreColor(entry.analysis?.atsScore ?? 0)}`}>
                    {entry.analysis?.atsScore ?? '—'}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">ATS</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-white/10 hover:text-rose-300"
                  aria-label="Remove entry"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
