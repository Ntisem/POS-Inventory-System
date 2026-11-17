import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '../types';
import { ADMIN_CREDENTIALS } from '../data/seed';

interface AuthContextValue {
  user: User | null;
  login: (username: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'pos-auth';

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadUser());

  const login = useCallback((username: string, password: string) => {
    if (
      username.trim().toLowerCase() === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      const next: User = {
        username: ADMIN_CREDENTIALS.username,
        displayName: ADMIN_CREDENTIALS.displayName,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setUser(next);
      return { ok: true };
    }
    return { ok: false, error: 'Invalid username or password' };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
