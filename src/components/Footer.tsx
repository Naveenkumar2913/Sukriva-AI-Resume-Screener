import { Link } from 'react-router-dom';
import { ADMIN } from '../lib/admin';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <img src="/images/sukriva-logo.jpg" alt="" className="h-5 w-5 rounded-md object-cover" />
          <span>
            © {new Date().getFullYear()} Sukriva · Admin {ADMIN.name} · Realtime resume screening
          </span>
        </div>
        <div className="flex gap-4 text-sm text-slate-500">
          <Link to="/dashboard" className="hover:text-slate-300">Dashboard</Link>
          <Link to="/screen" className="hover:text-slate-300">Screen</Link>
          <Link to="/history" className="hover:text-slate-300">History</Link>
        </div>
      </div>
    </footer>
  );
}
