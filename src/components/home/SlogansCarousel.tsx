'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getContentSettings,
  syncContentFromDB,
  CONTENT_CHANGED_EVENT,
  DEFAULT_CONTENT,
  type ContentSettings,
} from '@/lib/content-storage';

export default function SlogansCarousel() {
  const [slogans, setSlogans] = useState<string[]>(DEFAULT_CONTENT.slogans);
  const [current, setCurrent] = useState(0);

  // Hydrate from localStorage, then fetch fresh from Supabase
  useEffect(() => {
    setSlogans(getContentSettings().slogans);
    syncContentFromDB().then((fresh) => {
      if (fresh.slogans?.length) { setSlogans(fresh.slogans); setCurrent(0); }
    });

    const onChanged = (e: Event) => {
      const d = (e as CustomEvent<ContentSettings>).detail;
      if (d?.slogans?.length) {
        setSlogans(d.slogans);
        setCurrent(0);
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'malkia_content_settings') {
        const c = getContentSettings();
        setSlogans(c.slogans);
        setCurrent(0);
      }
    };
    window.addEventListener(CONTENT_CHANGED_EVENT, onChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CONTENT_CHANGED_EVENT, onChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Auto-rotate; resets cleanly when slogans array changes
  useEffect(() => {
    if (slogans.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slogans.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slogans]);

  if (slogans.length === 0) return null;

  return (
    <section className="py-14 md:py-20 bg-deep overflow-hidden relative">
      {/* Gold grain overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/logos/logo-malkia-detailed.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '400px',
        }}
      />

      {/* Decorative line */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <p className="font-body text-xs uppercase tracking-[0.35em] text-gold/50 mb-6">
          — Malkia B Cosmetics —
        </p>

        {/* Animated slogan */}
        <div className="relative h-20 md:h-24 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={current}
              initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="absolute font-accent text-3xl md:text-5xl lg:text-6xl text-gold leading-tight px-4"
            >
              &ldquo;{slogans[current]}&rdquo;
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {slogans.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 h-2 bg-gold'
                  : 'w-2 h-2 bg-gold/30 hover:bg-gold/60'
              }`}
              aria-label={`Slogan ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
