/**
 * Content storage — localStorage as fast cache, Supabase as source of truth.
 * Stores hero texts, slogans, badge, and CTA texts.
 */

export const CONTENT_STORAGE_KEY   = 'malkia_content_settings';
export const CONTENT_CHANGED_EVENT = 'malkia:content-changed';

export interface ContentSettings {
  heroFr1:   string;
  heroFr2:   string;
  heroSubFr: string;
  heroEn1:   string;
  heroEn2:   string;
  heroSubEn: string;
  badge:     string;
  cta1Fr:    string;
  cta2Fr:    string;
  slogans:   string[];
}

export const DEFAULT_CONTENT: ContentSettings = {
  heroFr1:   'Votre Beauté,',
  heroFr2:   'Notre Priorité',
  heroSubFr: 'True Beauty Comes From Within — Depuis 2015',
  heroEn1:   'Your Beauty,',
  heroEn2:   'Our Priority',
  heroSubEn: 'True Beauty Comes From Within — Since 2015',
  badge:     'Depuis 2015',
  cta1Fr:    'Découvrir nos produits',
  cta2Fr:    'Commander via WhatsApp',
  slogans: [
    'Unlock Your Beauty From Within',
    'The Beauty is Real',
    'Glowing with Malkia B',
    'Feel Malkia',
    'Beauty Origins Here',
    'True Beauty Comes From Within',
  ],
};

export function getContentSettings(): ContentSettings {
  if (typeof window === 'undefined') return DEFAULT_CONTENT;
  try {
    const raw = localStorage.getItem(CONTENT_STORAGE_KEY);
    if (!raw) return DEFAULT_CONTENT;
    return { ...DEFAULT_CONTENT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONTENT;
  }
}

export function saveContentSettings(settings: ContentSettings): void {
  localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(CONTENT_CHANGED_EVENT, { detail: settings }));
}

/* ── Supabase sync (async) ────────────────────────────────────────────────── */

export async function syncContentFromDB(): Promise<ContentSettings> {
  try {
    const res = await fetch('/api/content', { cache: 'no-store' });
    if (!res.ok) return getContentSettings();
    const fresh: ContentSettings = await res.json();
    saveContentSettings(fresh);
    return fresh;
  } catch {
    return getContentSettings();
  }
}

export async function pushContentToDB(settings: ContentSettings): Promise<void> {
  const hash = process.env.NEXT_PUBLIC_ADMIN_HASH ?? '';
  try {
    await fetch('/api/content', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hash}`,
      },
      body: JSON.stringify(settings),
    });
  } catch (err) {
    console.warn('[pushContentToDB] failed:', err);
  }
}
