'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import { useCart } from '@/store/CartContext';
import { ShoppingBag, Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Nav links config ─────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { href: '/',              key: 'home'     },
  { href: '/produits',      key: 'products' },
  { href: '/notre-histoire',key: 'about'    },
  { href: '/boutiques',     key: 'stores'   },
  { href: '/contact',       key: 'contact'  },
] as const;

export default function Navbar() {
  const t        = useTranslations('nav');
  const locale   = useLocale();
  const router   = useRouter();
  const pathname = usePathname();
  const { cartCount, toggleCart } = useCart();

  const [scrolled,  setScrolled]  = useState(false);
  const [hidden,    setHidden]    = useState(false);
  const [lastY,     setLastY]     = useState(0);
  const [mobileOpen,setMobileOpen]= useState(false);

  /* ── Scroll behaviour ─────────────────────────────────────────────────── */
  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    setScrolled(y > 20);
    setHidden(y > lastY && y > 120);
    setLastY(y);
  }, [lastY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  /* Close mobile menu on route change */
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const switchLocale = () => {
    const next = locale === 'fr' ? 'en' : 'fr';
    // Hard redirect ensures full SSR render with new locale — most reliable approach
    const currentPath = pathname === '/' ? '' : pathname;
    window.location.href = `/${next}${currentPath}`;
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === href : pathname.startsWith(href);

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <>
      <motion.header
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-cream/95 backdrop-blur-md shadow-[0_1px_20px_rgba(201,168,76,0.12)]'
            : 'bg-gradient-to-b from-deep/60 to-transparent backdrop-blur-[2px]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* ── Logo ──────────────────────────────────────────────────── */}
            <Link href="/" className="flex-shrink-0 relative z-10">
              <Image
                src="/images/logos/logo-simplified.png"
                alt="Malkia B Cosmetics"
                width={52}
                height={52}
                className="h-11 w-auto object-contain"
                priority
              />
            </Link>

            {/* ── Desktop Nav ────────────────────────────────────────────── */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ href, key }) => (
                <Link
                  key={key}
                  href={href}
                  className={`relative px-4 py-2 text-sm font-medium font-body transition-colors duration-200 rounded-full ${
                    isActive(href)
                      ? 'text-gold'
                      : scrolled ? 'text-deep/70 hover:text-deep' : 'text-white/90 hover:text-gold'
                  }`}
                >
                  {t(key)}
                  {isActive(href) && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-gold rounded-full"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* ── Right actions ──────────────────────────────────────────── */}
            <div className="flex items-center gap-2">
              {/* Language toggle */}
              <button
                onClick={switchLocale}
                aria-label={`Switch to ${locale === 'fr' ? 'English' : 'Français'}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-200 text-sm font-medium ${
                  scrolled
                    ? 'border-gold/30 hover:border-gold text-deep/70 hover:text-gold hover:bg-gold/8'
                    : 'border-white/40 hover:border-gold text-white hover:text-gold hover:bg-white/10'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="font-body text-xs tracking-wide uppercase">
                  {locale === 'fr' ? 'EN' : 'FR'}
                </span>
              </button>

              {/* Cart */}
              <button
                onClick={toggleCart}
                aria-label={t('cart')}
                className={`relative p-2.5 rounded-full transition-all duration-200 ${scrolled ? 'text-deep/70 hover:bg-gold/10 hover:text-gold' : 'text-white hover:bg-white/10 hover:text-gold'}`}
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-fuchsia text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </button>

              {/* Mobile hamburger */}
              <button
                className={`md:hidden p-2.5 rounded-full transition-all duration-200 ${scrolled ? 'text-deep/70 hover:bg-gold/10 hover:text-gold' : 'text-white hover:bg-white/10 hover:text-gold'}`}
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── Mobile Menu ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-deep/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            {/* Slide-in panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-cream shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gold/15">
                <Image
                  src="/images/logos/logo-simplified.png"
                  alt="Malkia B Cosmetics"
                  width={40}
                  height={40}
                  className="h-9 w-auto object-contain"
                />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-full hover:bg-gold/10 text-deep/60"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Links */}
              <nav className="flex-1 px-4 py-6 space-y-1">
                {NAV_LINKS.map(({ href, key }, i) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      href={href}
                      className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium font-body transition-all duration-200 ${
                        isActive(href)
                          ? 'bg-gold/12 text-gold-dark font-semibold'
                          : 'text-deep/70 hover:bg-gold/8 hover:text-deep'
                      }`}
                    >
                      {t(key)}
                      {isActive(href) && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold" />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Footer: language + social */}
              <div className="px-6 py-5 border-t border-gold/15">
                <button
                  onClick={switchLocale}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gold/30 hover:bg-gold/8 text-sm font-body font-medium text-deep/60 hover:text-gold transition-all duration-200"
                >
                  <Globe className="w-4 h-4" />
                  {locale === 'fr' ? '🇬🇧 Switch to English' : '🇫🇷 Passer en Français'}
                </button>
                <p className="mt-4 text-center text-xs font-accent text-gold">
                  True Beauty Comes From Within
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
