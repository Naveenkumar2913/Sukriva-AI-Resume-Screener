import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  authenticate,
  clearSession,
  loadSession,
  saveSession,
  type User,
} from '../lib/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const defaultUser: User = {
  id: 'u1',
  name: 'Naveen',
  email: 'admin@sukriva.com',
  role: 'Admin',
  avatar: 'N',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = loadSession();
    // Default to Naveen admin so screening is never blocked by login
    setUser(session ?? defaultUser);
    if (!session) saveSession(defaultUser);
    setLoading(false);
  }, []);

  const login = useCallback((email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      return { ok: false as const, error: 'Email and password are required.' };
    }
    const result = authenticate(email, password);
    if (!result) {
      return { ok: false as const, error: 'Invalid credentials. Try a demo account.' };
    }
    saveSession(result);
    setUser(result);
    return { ok: true as const };
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
    }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Never crash the app — return Naveen guest session
    return {
      user: defaultUser,
      loading: false,
      login: () => ({ ok: false as const, error: 'Auth not ready' }),
      logout: () => undefined,
      isAuthenticated: true,
    };
  }
  return ctx;
}
