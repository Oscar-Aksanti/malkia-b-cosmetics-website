'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Admin authentication using client-side SHA-256 hashing.
 * The password itself is never stored — only its SHA-256 hash is compared.
 * NEXT_PUBLIC_ADMIN_HASH contains the pre-computed hash of the real password.
 *
 * To generate a new hash:  echo -n "YourPassword" | sha256sum
 */

const ADMIN_HASH  = process.env.NEXT_PUBLIC_ADMIN_HASH ?? '';
const STORAGE_KEY = 'malkia_admin_session';
// Session duration: 24 hours
const SESSION_TTL = 24 * 60 * 60 * 1000;

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

/** Compute SHA-256 hash of a string using the Web Crypto API (works everywhere) */
async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading]       = useState(true);
  const router = useRouter();

  // On mount: check if there's a valid unexpired session
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { ts } = JSON.parse(raw) as { ts: number };
        if (Date.now() - ts < SESSION_TTL) {
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (password: string): Promise<boolean> => {
    if (!ADMIN_HASH) return false;
    const hash = await sha256(password);
    if (hash === ADMIN_HASH) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now() }));
      setIsLoggedIn(true);
      return true;
    }
    return false;
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
