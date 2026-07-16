'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { ChevronDown, Truck, Award, Headphones } from 'lucide-react';
import { generateGreetingMessage, openWhatsApp } from '@/lib/whatsapp';
import type { Locale } from '@/types';
import {
  getHeroSettings,
  HERO_CHANGED_EVENT,
  DEFAULT_HERO,
  type HeroSettings,
} from '@/lib/hero-settings';
import {
  getContentSettings,
  syncContentFromDB,
  CONTENT_CHANGED_EVENT,
  DEFAULT_CONTENT,
  type ContentSettings,
} from '@/lib/content-storage';

const fadeUp = (delay = 0) => ({
  initial:    { y: 28 },
  animate:    { y: 0   },
  transition: {
    duration:  0.55,
    delay:     delay * 0.5,
    ease:      [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  },
});

export default function HeroSection() {
  const t      = useTranslations();
  const locale = useLocale() as Locale;

  /* ── Hero settings (slides/carousel, synced with admin) ─────────── */
  const [settings, setSettings] = useState<HeroSettings>(DEFAULT_HERO);
  const [activeIdx, setActiveIdx] = useState(0);

  /* ── Content settings (hero text, synced with admin/contenu) ─────── */
  const [content, setContent] = useState<ContentSettings>(DEFAULT_CONTENT);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load from localStorage on mount, then sync from Supabase
  useEffect(() => {
    setSettings(getHeroSettings());
    setContent(getContentSettings());
    syncContentFromDB().then((fresh) => setContent(fresh));
  }, []);

  // Listen for real-time updates from the admin panel (same tab)
  useEffect(() => {
    const onHeroChanged = (e: Event) => {
      const detail = (e as CustomEvent<HeroSettings>).detail;
      setSettings(detail);
      setActiveIdx(0);
    };
    const onContentChanged = (e: Event) => {
      const detail = (e as CustomEvent<ContentSettings>).detail;
      if (detail) setContent(detail);
    };
    window.addEventListener(HERO_CHANGED_EVENT, onHeroChanged);
    window.addEventListener(CONTENT_CHANGED_EVENT, onContentChanged);
    return () => {
      window.removeEventListener(HERO_CHANGED_EVENT, onHeroChanged);
      window.removeEventListener(CONTENT_CHANGED_EVENT, onContentChanged);
    };
  }, []);

  // Also listen for cross-tab storage changes
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'malkia_hero_settings') {
        setSettings(getHeroSettings());
        setActiveIdx(0);
      }
      if (e.key === 'malkia_content_settings') {
        setContent(getContentSettings());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /* ── Auto-advance carousel ────────────────────────────────────────── */
  const advance = useCallback(() => {
    setActiveIdx((i) => (i + 1) % settings.slides.length);
  }, [settings.slides.length]);

  useEffect(() => {
    if (settings.mode !== 'carousel' || settings.slides.length <= 1) return;

    timerRef.current = setInterval(advance, settings.interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [settings.mode, settings.slides.length, settings.interval, advance]);

  // Reset index when slides change
  useEffect(() => {
    setActiveIdx(0);
  }, [settings.slides.length]);

  const goTo = (idx: number) => {
    setActiveIdx(idx);
    // Reset timer so it doesn't immediately advance after manual click
    if (timerRef.current) clearInterval(timerRef.current);
    if (settings.mode === 'carousel' && settings.slides.length > 1) {
      timerRef.current = setInterval(advance, settings.interval);
    }
  };

  const currentSlide = settings.slides[activeIdx] ?? settings.slides[0];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden grain">

      {/* ── Background slides ──────────────────────────────────────── */}
      {settings.slides.map((slide, idx) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: idx === activeIdx ? 1 : 0, zIndex: idx === activeIdx ? 1 : 0 }}
          aria-hidden={idx !== activeIdx}
        >
          <Image
            src={slide.url}
            alt={slide.alt}
            fill
            priority={idx === 0}
            className="object-cover object-center"
            unoptimized={slide.url.startsWith('data:')}
          />
        </div>
      ))}

      {/* ── Gradient overlays (above images) ───────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-r from-deep/88 via-deep/55 to-deep/20" style={{ zIndex: 2 }} />
      <div className="absolute inset-0 bg-gradient-to-t from-deep/70 via-transparent to-transparent" style={{ zIndex: 2 }} />

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24" style={{ zIndex: 3 }}>
        <div className="max-w-2xl">

          {/* Badge */}
          <motion.div {...fadeUp(0.1)}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold/20 border border-gold/40 rounded-full text-gold font-body text-sm font-medium mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              {content.badge || 'Depuis 2015'}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white leading-[1.05] mb-6"
            {...fadeUp(0.2)}
          >
            {locale === 'fr' ? content.heroFr1 : content.heroEn1}
            <br />
            <span className="text-fuchsia">{locale === 'fr' ? content.heroFr2 : content.heroEn2}</span>
          </motion.h1>

          {/* Slogan */}
          <motion.p
            className="font-accent text-gold text-xl md:text-2xl mb-3"
            {...fadeUp(0.3)}
          >
            &ldquo;True Beauty Comes From Within&rdquo;
          </motion.p>

          {/* Subtitle */}
          <motion.p
            className="font-body text-white/65 text-base md:text-lg mb-10 leading-relaxed"
            {...fadeUp(0.35)}
          >
            {locale === 'fr' ? content.heroSubFr : content.heroSubEn}
          </motion.p>

          {/* CTAs */}
          <motion.div className="flex flex-col sm:flex-row gap-4" {...fadeUp(0.45)}>
            <Link
              href="/produits"
              className="inline-flex items-center justify-center px-8 py-4 bg-gold hover:bg-gold-dark text-deep font-body font-bold rounded-full text-base shadow-[0_4px_24px_rgba(201,168,76,0.45)] hover:shadow-[0_6px_32px_rgba(201,168,76,0.55)] transition-all duration-200 active:scale-95"
            >
              {locale === 'fr' ? (content.cta1Fr || t('hero.cta1')) : t('hero.cta1')}
            </Link>

            <button
              onClick={() => openWhatsApp(generateGreetingMessage(locale))}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/18 border border-white/30 hover:border-whatsapp/60 text-white font-body font-semibold rounded-full text-base backdrop-blur-sm transition-all duration-200 active:scale-95"
            >
              <FaWhatsapp className="w-5 h-5 text-whatsapp" />
              {locale === 'fr' ? (content.cta2Fr || t('hero.cta2')) : t('hero.cta2')}
            </button>
          </motion.div>

          {/* Trust mini-bar */}
          <motion.div
            className="flex flex-wrap items-center gap-5 mt-12 pt-8 border-t border-white/10"
            {...fadeUp(0.55)}
          >
            {[
              { Icon: Award,      label: t('trustBar.since')    },
              { Icon: Truck,      label: t('trustBar.delivery') },
              { Icon: Headphones, label: t('trustBar.service')  },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-white/60">
                <Icon className="w-4 h-4 text-gold flex-shrink-0" />
                <span className="font-body text-sm">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Carousel dots (carousel mode, multiple slides) ─────────── */}
      {settings.mode === 'carousel' && settings.slides.length > 1 && (
        <div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2"
          style={{ zIndex: 4 }}
        >
          {settings.slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === activeIdx
                  ? 'w-6 h-2 bg-gold'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Scroll indicator ─────────────────────────────────────────── */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30"
        style={{ zIndex: 4 }}
      >
        <ChevronDown className="w-6 h-6" />
      </motion.div>
    </section>
  );
}
