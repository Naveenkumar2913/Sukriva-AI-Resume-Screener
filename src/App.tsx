import { Component, type ErrorInfo, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ScreenPage from './pages/ScreenPage';
import HistoryPage from './pages/HistoryPage';

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Sukriva UI error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold text-white">Something went wrong</h1>
          <p className="mt-3 text-sm text-slate-400">{this.state.error.message}</p>
          <button
            type="button"
            className="mt-6 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white"
            onClick={() => {
              this.setState({ error: null });
              window.location.href = '/screen';
            }}
          >
            Reload screening
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/screen" element={<ScreenPage />} />
                <Route path="/history" element={<HistoryPage />} />
              </Routes>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
