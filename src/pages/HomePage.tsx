import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  Target,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  FileSearch,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ADMIN } from '../lib/admin';

const features = [
  {
    icon: Zap,
    title: 'Realtime Analysis',
    description:
      'Built only for engineering B.Tech students — skills, projects, internships, and campus-placement ATS scoring.',
  },
  {
    icon: Target,
    title: 'JD-Aware Matching',
    description:
      'Upload a resume and optional job description. Sukriva maps requirements to candidate evidence automatically.',
  },
  {
    icon: BarChart3,
    title: 'Transparent Scores',
    description:
      'Category breakdowns, matched vs missing skills, strengths, and concerns — not a black-box number.',
  },
  {
    icon: ShieldCheck,
    title: 'File upload ready',
    description:
      'Upload PDF, DOCX, or TXT resumes. Text is extracted automatically — no manual paste required.',
  },
];

const steps = [
  { step: '01', title: 'Upload a resume', detail: 'PDF, DOCX, or TXT — extracted in the browser.' },
  { step: '02', title: 'Optional job description', detail: 'Add a JD to improve ATS matching accuracy.' },
  { step: '03', title: 'Get live analysis', detail: 'ATS score, radar chart, job roles, and AI adviser.' },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
};

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-200">
              <Sparkles className="h-3.5 w-3.5" />
              Sukriva · Admin {ADMIN.name}
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Screen B.Tech resumes for{' '}
              <span className="text-gradient">realtime</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-400 leading-relaxed">
              Upload a resume and get transparent ATS scoring, skill gaps, job recommendations,
              and an AI adviser — no login required.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/screen"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:from-brand-400 hover:to-brand-500"
              >
                Start screening
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                Open dashboard
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent-400" />
                Live analysis in seconds
              </div>
              <div className="flex items-center gap-2">
                <FileSearch className="h-4 w-4 text-brand-400" />
                PDF · DOCX · TXT upload
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-brand-500/20 to-accent-500/10 blur-2xl" />
            <img
              src="/images/hero-screening.jpg"
              alt="Sukriva B.Tech engineering placement screening visualization"
              className="relative w-full rounded-2xl border border-white/10 shadow-2xl shadow-brand-900/40"
            />
          </motion.div>
        </div>
      </section>

      <section className="border-t border-white/5 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Built for B.Tech campus placements
            </h2>
            <p className="mt-3 text-slate-400">
              Fast, explainable screening so you can focus on the best fits.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp}
                transition={{ delay: i * 0.08 }}
                className="glass group rounded-2xl p-6 transition hover:border-brand-400/30"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300 transition group-hover:bg-brand-500/25">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-white/5 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <motion.div {...fadeUp}>
            <img
              src="/images/matching-visual.jpg"
              alt="Abstract skill matching interface"
              className="w-full rounded-2xl border border-white/10 shadow-xl"
            />
          </motion.div>
          <div>
            <motion.h2 {...fadeUp} className="font-display text-3xl font-bold text-white sm:text-4xl">
              Three steps to a clear decision
            </motion.h2>
            <div className="mt-8 space-y-6">
              {steps.map((s, i) => (
                <motion.div key={s.step} {...fadeUp} transition={{ delay: i * 0.1 }} className="flex gap-4">
                  <span className="font-display text-2xl font-bold text-brand-400/80">{s.step}</span>
                  <div>
                    <h3 className="font-semibold text-white">{s.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{s.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 py-20">
        <motion.div {...fadeUp} className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Ready to screen a B.Tech resume?
          </h2>
          <p className="mt-3 text-slate-400">
            Upload a resume and run ATS analysis instantly — managed by Admin {ADMIN.name}.
          </p>
          <Link
            to="/screen"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:opacity-95"
          >
            Open screening workspace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

    </div>
  );
}
