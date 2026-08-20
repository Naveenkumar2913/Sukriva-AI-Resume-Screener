import { Link, NavLink } from 'react-router-dom';
import { MotionConfig, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ADMIN } from '../lib/admin';

const links = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/screen', label: 'Screen Resume' },
  { to: '/history', label: 'History' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <MotionConfig reducedMotion="user">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-surface-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-2.5">
            <img
              src="/images/sukriva-logo.jpg"
              alt="Sukriva"
              className="h-9 w-9 rounded-xl object-cover shadow-lg shadow-brand-500/30 ring-1 ring-white/10"
            />
            <span className="font-display text-lg font-semibold tracking-tight">
              Suk<span className="text-gradient">riva</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-xs font-bold text-white">
                {ADMIN.avatar}
              </span>
              <div className="leading-tight">
                <p className="text-xs font-semibold text-white">{ADMIN.name}</p>
                <p className="text-[10px] text-slate-400">{ADMIN.role}</p>
              </div>
            </div>
            <Link
              to="/screen"
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:from-brand-400 hover:to-brand-500"
            >
              Start Screening
            </Link>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-white/10 px-4 py-3 md:hidden"
          >
            <div className="mb-2 flex items-center gap-2 px-3 py-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-xs font-bold text-white">
                {ADMIN.avatar}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{ADMIN.name}</p>
                <p className="text-xs text-slate-400">{ADMIN.role}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive ? 'bg-white/10 text-white' : 'text-slate-400'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to="/screen"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-xl bg-brand-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
              >
                Start Screening
              </Link>
            </div>
          </motion.div>
        )}
      </header>
    </MotionConfig>
  );
}
