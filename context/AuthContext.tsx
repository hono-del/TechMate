'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  getDealer,
  getUser,
  canAccessPath,
  type AppUser,
  type Dealer,
  type Role,
} from '@/data/users';

const STORAGE_KEY = 'techmate-user-id';

interface AuthContextType {
  ready: boolean;
  user: AppUser | null;
  dealer: Dealer | null;
  login: (userId: string) => void;
  logout: () => void;
  canAccess: (pathname: string) => boolean;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  ready: false,
  user: null,
  dealer: null,
  login: () => {},
  logout: () => {},
  canAccess: () => false,
  hasRole: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    try {
      const id = localStorage.getItem(STORAGE_KEY);
      if (id) setUser(getUser(id) ?? null);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const login = useCallback((userId: string) => {
    const next = getUser(userId) ?? null;
    setUser(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, next.id);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const dealer = useMemo(() => getDealer(user?.dealerId ?? null), [user]);

  const canAccess = useCallback(
    (pathname: string) => (user ? canAccessPath(user.role, pathname) : false),
    [user]
  );

  const hasRole = useCallback(
    (...roles: Role[]) => !!user && roles.includes(user.role),
    [user]
  );

  return (
    <AuthContext.Provider value={{ ready, user, dealer, login, logout, canAccess, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
