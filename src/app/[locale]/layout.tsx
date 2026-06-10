import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Cormorant_Garamond, Poppins, Dancing_Script } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { CartProvider } from '@/store/CartContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import CartDrawer from '@/components/layout/CartDrawer';
import MobileNav from '@/components/layout/MobileNav';
import LangSetter from '@/components/LangSetter';
import LiveIndicator from '@/components/LiveIndicator';
// globals.css is imported in the root layout (app/layout.tsx)

/* ── Fonts ────────────────────────────────────────────────────────────────── */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const dancing = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing',
  display: 'swap',
});

/* ── Metadata ─────────────────────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hero' });

  return {
    title: {
      default: 'Malkia B Cosmetics',
      template: '%s | Malkia B Cosmetics',
    },
    description: `${t('subtitle')} — Kigali, Rwanda & Bukavu, DRC`,
    keywords: [
      'Malkia B Cosmetics', 'cosmetics', 'beauty', 'Rwanda', 'DRC',
      'skincare', 'body lotion', 'parfum', 'Kigali', 'Bukavu',
    ],
    metadataBase: new URL('https://malkiabcosmetics.com'),
    openGraph: {
      siteName: 'Malkia B Cosmetics',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      type: 'website',
    },
  };
}

/* ── Static params ────────────────────────────────────────────────────────── */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/* ── Layout ───────────────────────────────────────────────────────────────── */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as 'fr' | 'en')) {
    notFound();
  }

  const messages = await getMessages();

  const fontClasses = `${cormorant.variable} ${poppins.variable} ${dancing.variable}`;

  return (
    <>
      {/* Apply locale + font classes to html/body at runtime */}
      <LangSetter locale={locale} fontClasses={fontClasses} />

      {/* Inline style tag to apply Tailwind bg-cream + font vars via SSR */}
      <style>{`
        body { background-color: #FFF9F5; }
        body.antialiased { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      `}</style>

      <NextIntlClientProvider messages={messages}>
        <CartProvider>
          {/* ── Navigation ────────────────────────────────────────── */}
          <Navbar />

          {/* ── Page content ──────────────────────────────────────── */}
          <main className="flex-1 pt-16 md:pt-20 min-h-screen flex flex-col bg-cream antialiased">
            {children}
          </main>

          {/* ── Footer ────────────────────────────────────────────── */}
          <Footer />

          {/* ── Cart drawer ───────────────────────────────────────── */}
          <CartDrawer />

          {/* ── Mobile bottom nav ─────────────────────────────────── */}
          <MobileNav />

          {/* ── Floating WhatsApp ─────────────────────────────────── */}
          <WhatsAppButton />

          {/* ── Live stream indicator (shown when admin enables it) ── */}
          <LiveIndicator />
        </CartProvider>
      </NextIntlClientProvider>
    </>
  );
}
