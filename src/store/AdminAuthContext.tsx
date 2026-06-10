'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Admin authentication via server-side API routes.
 * Password is validated on the server (never exposed in the frontend bundle).
 * A signed token is stored in localStorage; it expires after 24 hours.
 */

const STORAGE_KEY = 'malkia_admin_token';

interface AdminAuthCtx {
  isLoggedIn: boolean;
  loading: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthCtx>({
  isLoggedIn: false,
  loading: true,
  login: async () => false,
  logout: () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading]       = useState(true);
  const router = useRouter();

  // On mount, verify stored token with the server
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!token) {
      setLoading(false);
      return;
    }
    fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then(({ valid }) => {
        if (valid) {
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      })
      .catch(() => localStorage.removeItem(STORAGE_KEY))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) return false;
      const { token } = await res.json();
      localStorage.setItem(STORAGE_KEY, token);
      setIsLoggedIn(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsLoggedIn(false);
    router.push('/admin/login');
  }, [router]);

  return (
    <AdminAuthContext.Provider value={{ isLoggedIn, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
