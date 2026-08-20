import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  FileSearch,
  History,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { ADMIN } from '../lib/admin';
import { useHistory } from '../hooks/useHistory';
import { AtsTrendChart } from '../components/Charts';

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 65) return 'text-cyan-400';
  if (score >= 45) return 'text-amber-400';
  return 'text-rose-400';
}

export default function DashboardPage() {
  const { history, trend } = useHistory();

  const avgScore =
    history.length === 0
      ? 0
      : Math.round(
          history.reduce((s, h) => s + (h.analysis?.atsScore ?? 0), 0) / history.length
        );

  const strongHires = history.filter((h) =>
    ['Strong Hire', 'Excellent', 'A', 'A+'].includes(h.analysis?.recommendation) ||
    (h.analysis?.atsScore ?? 0) >= 80
  ).length;

  const interviews = history.filter(
    (h) => h.analysis?.recommendation === 'Interview' || ((h.analysis?.atsScore ?? 0) >= 65 && (h.analysis?.atsScore ?? 0) < 80)
  ).length;

  const recent = history.slice(0, 5);

  const stats = [
    { label: 'Total screens', value: history.length, icon: FileSearch, tint: 'text-brand-300' },
    { label: 'Avg placement ATS', value: avgScore, icon: BarChart3, tint: 'text-accent-400' },
    { label: 'Placement ready', value: strongHires, icon: TrendingUp, tint: 'text-emerald-400' },
    { label: 'Interview ready', value: interviews, icon: Users, tint: 'text-cyan-300' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-200">
            <Sparkles className="h-3.5 w-3.5" />
            Sukriva dashboard
          </div>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Welcome back, {ADMIN.name}
          </h1>
          <p className="mt-2 text-slate-400">
            {ADMIN.role} · ATS intelligence for open roles
          </p>
        </div>
        <Link
          to="/screen"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:from-brand-400 hover:to-brand-500"
        >
          Upload & analyze
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass rounded-2xl p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {s.label}
              </span>
              <s.icon className={`h-4 w-4 ${s.tint}`} />
            </div>
            <p className={`font-display text-3xl font-bold tabular-nums ${s.tint}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="glass rounded-2xl p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-white">Recent screenings</h2>
            <Link to="/history" className="inline-flex items-center gap-1 text-xs font-medium text-brand-300 hover:underline">
              <History className="h-3.5 w-3.5" />
              View all
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center">
              <p className="text-sm text-slate-400">Upload a resume to run your first Gemini ATS analysis.</p>
              <Link to="/screen" className="mt-3 inline-block text-sm font-semibold text-brand-300 hover:underline">
                Open screening workspace →
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {recent.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">
                      {entry.analysis?.candidateName || 'Candidate'}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {entry.fileName} · {entry.analysis?.recommendation} ·{' '}
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`font-display text-xl font-bold tabular-nums ${scoreColor(entry.analysis?.atsScore ?? 0)}`}>
                    {entry.analysis?.atsScore ?? '—'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-semibold text-white">ATS trend</h2>
          <AtsTrendChart points={trend} />
          <p className="mt-3 text-xs text-slate-500">
            Powered by <code className="text-slate-400">updateTrendChart()</code> — updates after every screening.
          </p>
        </div>
      </div>
    </div>
  );
}
