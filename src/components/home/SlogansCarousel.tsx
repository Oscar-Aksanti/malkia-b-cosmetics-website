'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

const SLOGANS = [
  'Unlock Your Beauty From Within',
  'The Beauty is Real',
  'Glowing with Malkia B',
  'Feel Malkia',
  'Beauty Origins Here',
  'True Beauty Comes From Within',
];

export default function SlogansCarousel() {
  const t = useTranslations('slogans');
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLOGANS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-14 md:py-20 bg-deep overflow-hidden relative">
      {/* Gold grain overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
           style={{ backgroundImage: 'url(/images/logos/logo-malkia-detailed.png)', backgroundRepeat: 'repeat', backgroundSize: '400px' }} />

      {/* Decorative lines */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        {/* Static label */}
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
              &ldquo;{SLOGANS[current]}&rdquo;
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {SLOGANS.map((_, i) => (
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
