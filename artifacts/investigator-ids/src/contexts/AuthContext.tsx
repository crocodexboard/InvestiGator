import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

export interface AuthUser {
  id: number;
  robloxUsername: string;
  status: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (robloxUsername: string, password: string) => Promise<void>;
  register: (robloxUsername: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "investigator_token";
const USER_KEY = "investigator_user";

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem(TOKEN_KEY));
  }, []);

  const persist = useCallback((t: string, u: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(t);
    setUser(u);
    setAuthTokenGetter(() => localStorage.getItem(TOKEN_KEY));
  }, []);

  const login = useCallback(async (robloxUsername: string, password: string) => {
    setIsLoading(true);
    try {
      const { token: t, user: u } = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ robloxUsername, password }),
      });
      persist(t, u);
    } finally {
      setIsLoading(false);
    }
  }, [persist]);

  const register = useCallback(async (robloxUsername: string, password: string) => {
    setIsLoading(true);
    try {
      const { token: t, user: u } = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ robloxUsername, password }),
      });
      persist(t, u);
    } finally {
      setIsLoading(false);
    }
  }, [persist]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setAuthTokenGetter(null);
  }, []);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return null;
      const next = { ...prev, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
