import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_USERS } from '../lib/auth';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const [email, setEmail] = useState('admin@sukriva.com');
  const [password, setPassword] = useState('sukriva123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await login(email, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      navigate(from, { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:block"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-200">
          <Sparkles className="h-3.5 w-3.5" />
          Sukriva secure workspace
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight text-white">
          Sign in for B.Tech{' '}
          <span className="text-gradient">realtime</span> resume screening
        </h1>
        <p className="mt-4 max-w-md text-slate-400 leading-relaxed">
          For engineering B.Tech students & placement cells — ATS scoring, project review, and internship role fit.
        </p>
        <img
          src="/images/hero-screening.jpg"
          alt="Sukriva screening visualization"
          className="mt-8 w-full rounded-2xl border border-white/10 shadow-2xl"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass glow-ring mx-auto w-full max-w-md rounded-3xl p-7 sm:p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <img src="/images/sukriva-logo.jpg" alt="Sukriva" className="h-10 w-10 rounded-xl object-cover" />
          <div>
            <h2 className="font-display text-xl font-bold text-white">Welcome to Sukriva</h2>
            <p className="text-sm text-slate-400">Enter your credentials to continue</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-surface-900/80 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-600 focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                placeholder="you@sukriva.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-surface-900/80 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-slate-600 focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:from-brand-400 hover:to-brand-500 disabled:opacity-60"
          >
            <ShieldCheck className="h-4 w-4" />
            {submitting ? 'Signing in…' : 'Sign in to Sukriva'}
          </button>
        </form>

        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Demo credentials — click to fill
          </p>
          <div className="space-y-2">
            {DEMO_USERS.map((u) => (
              <button
                key={u.email}
                type="button"
                onClick={() => fillDemo(u.email, u.password)}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:bg-white/10"
              >
                <div>
                  <p className="text-sm font-medium text-white">{u.role}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
                <code className="rounded bg-black/30 px-2 py-0.5 text-[11px] text-brand-200">
                  {u.password}
                </code>
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          <Link to="/" className="text-brand-300 hover:underline">Back to home</Link>
        </p>
      </motion.div>
    </div>
  );
}
