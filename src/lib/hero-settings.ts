/** ──────────────────────────────────────────────────────────────────────────
 *  Hero Settings — shared between /admin/apparence and HeroSection
 *  Local images are compressed (≤1200px) before storage to avoid the
 *  ~5MB localStorage quota, allowing up to 5+ images in the carousel.
 * ─────────────────────────────────────────────────────────────────────────── */

export const HERO_STORAGE_KEY   = 'malkia_hero_settings';
export const HERO_CHANGED_EVENT = 'malkia:hero-changed';

export interface HeroSlide {
  id:  string;
  url: string;
  alt: string;
}

export interface HeroSettings {
  mode:     'single' | 'carousel';
  slides:   HeroSlide[];
  /** Auto-advance interval in milliseconds (carousel mode only) */
  interval: number;
}

export const DEFAULT_HERO: HeroSettings = {
  mode:     'single',
  slides:   [
    {
      id:  'default',
      url: '/images/models/avatar-feel-malkia.png',
      alt: 'Feel Malkia — Malkia B Cosmetics',
    },
  ],
  interval: 5000,
};

export const INTERVAL_OPTIONS = [
  { label: '5 secondes',  value: 5000  },
  { label: '8 secondes',  value: 8000  },
  { label: '12 secondes', value: 12000 },
  { label: '20 secondes', value: 20000 },
];

/* ── Image compression ──────────────────────────────────────────────────── */
/**
 * Compress an image File to a JPEG base64 string ≤ maxWidth px.
 * Keeps each image ~150-300KB so 5 images fit comfortably in localStorage.
 */
export async function compressImage(
  file: File,
  maxWidth = 1200,
  quality  = 0.75,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload  = (e) => {
      const img = new window.Image();
      img.onerror = reject;
      img.onload  = () => {
        const scale  = Math.min(1, maxWidth / img.width);
        const w      = Math.round(img.width  * scale);
        const h      = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width  = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(e.target!.result as string); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/* ── Storage helpers ────────────────────────────────────────────────────── */
export function getHeroSettings(): HeroSettings {
  if (typeof window === 'undefined') return DEFAULT_HERO;
  try {
    const raw = localStorage.getItem(HERO_STORAGE_KEY);
    if (!raw) return DEFAULT_HERO;
    const parsed = JSON.parse(raw) as Partial<HeroSettings>;
    return {
      mode:     parsed.mode     ?? DEFAULT_HERO.mode,
      slides:   Array.isArray(parsed.slides) && parsed.slides.length > 0
                  ? parsed.slides
                  : DEFAULT_HERO.slides,
      interval: parsed.interval ?? DEFAULT_HERO.interval,
    };
  } catch {
    return DEFAULT_HERO;
  }
}

export function saveHeroSettings(settings: HeroSettings): void {
  try {
    localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Quota exceeded — store only static paths (not base64) as fallback
    const fallback: HeroSettings = {
      ...settings,
      slides: settings.slides.map((s) => ({
        ...s,
        url: s.url.startsWith('data:') ? DEFAULT_HERO.slides[0].url : s.url,
      })),
    };
    try { localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(fallback)); } catch { /* ignore */ }
  }
  // Always dispatch the event with full settings (including base64) for live sync
  window.dispatchEvent(new CustomEvent(HERO_CHANGED_EVENT, { detail: settings }));
}
