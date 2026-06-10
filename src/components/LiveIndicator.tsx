'use client';

import { useState, useEffect } from 'react';
import { FaInstagram, FaTiktok } from 'react-icons/fa';

export interface LiveSettings {
  active:   boolean;
  platform: 'instagram' | 'tiktok';
  url:      string;
}

export const LIVE_STORAGE_KEY = 'malkia_live_settings';

export const DEFAULT_LIVE: LiveSettings = {
  active:   false,
  platform: 'instagram',
  url:      '',
};

export function getLiveSettings(): LiveSettings {
  if (typeof window === 'undefined') return DEFAULT_LIVE;
  try {
    const raw = localStorage.getItem(LIVE_STORAGE_KEY);
    return raw ? { ...DEFAULT_LIVE, ...JSON.parse(raw) } : DEFAULT_LIVE;
  } catch {
    return DEFAULT_LIVE;
  }
}

export function saveLiveSettings(s: LiveSettings): void {
  localStorage.setItem(LIVE_STORAGE_KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent('malkia:live-changed', { detail: s }));
}

const PLATFORM_CONFIG = {
  instagram: { label: 'Instagram', icon: FaInstagram, color: '#E91E8C', bg: 'bg-pink-600' },
  tiktok:    { label: 'TikTok',    icon: FaTiktok,    color: '#ffffff', bg: 'bg-black'    },
};

export default function LiveIndicator() {
  const [live, setLive] = useState<LiveSettings>(DEFAULT_LIVE);

  useEffect(() => {
    setLive(getLiveSettings());

    const onChanged = (e: Event) => setLive((e as CustomEvent<LiveSettings>).detail);
    const onStorage = (e: StorageEvent) => {
      if (e.key === LIVE_STORAGE_KEY) setLive(getLiveSettings());
    };

    window.addEventListener('malkia:live-changed', onChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('malkia:live-changed', onChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  if (!live.active || !live.url) return null;

  const cfg = PLATFORM_CONFIG[live.platform];
  const Icon = cfg.icon;

  return (
    <a
      href={live.url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-4 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-full shadow-2xl text-white text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95"
      style={{ background: 'linear-gradient(135deg, #E91E8C 0%, #ff5e7a 100%)' }}
    >
      {/* Pulsing red dot */}
      <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
      </span>

      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />

      <span className="tracking-wide uppercase" style={{ letterSpacing: '0.08em' }}>
        LIVE sur {cfg.label}
      </span>
    </a>
  );
}
