import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Quote } from 'lucide-react';

export default async function BrandStory() {
  const t  = await getTranslations('about');
  const ts = await getTranslations('sections');

  return (
    <section className="py-16 md:py-24 bg-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* ── Image ──────────────────────────────────────────────────── */}
          <div className="relative order-2 md:order-1">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/5]">
              <Image
                src="/images/ceo/ceo-beauty-specialists.png"
                alt="Hamim Banga — CEO Malkia B Cosmetics"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep/50 to-transparent" />

              {/* Tag overlay */}
              <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-2">
                {['Beauty Specialists', 'Your Skin Partners'].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex self-start px-4 py-1.5 bg-gold/90 text-deep text-xs font-body font-bold rounded-full backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-fuchsia rounded-full flex flex-col items-center justify-center shadow-lg">
              <span className="font-body font-bold text-white text-xs">Since</span>
              <span className="font-heading text-white text-xl font-bold leading-none">2015</span>
            </div>
          </div>

          {/* ── Text ───────────────────────────────────────────────────── */}
          <div className="order-1 md:order-2">
            <p className="font-accent text-gold text-xl mb-3">{ts('ourStory')}</p>
            <h2 className="font-heading text-4xl md:text-5xl text-deep leading-tight mb-6">
              {ts('ourStorySubtitle')}
            </h2>
            <div className="h-px w-16 bg-gradient-to-r from-gold to-fuchsia mb-6" />

            <div className="space-y-4">
              {[t('story1'), t('story2'), t('story3')].map((text, i) => (
                <p key={i} className="font-body text-deep/65 leading-relaxed">{text}</p>
              ))}
            </div>

            {/* CEO quote */}
            <blockquote className="mt-8 p-5 bg-soft-pink rounded-2xl border-l-4 border-gold relative">
              <Quote className="absolute top-4 right-4 w-8 h-8 text-gold/20" />
              <p className="font-accent text-gold-dark text-lg leading-snug mb-3">
                &ldquo;{t('founderQuote')}&rdquo;
              </p>
              <footer className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 overflow-hidden relative">
                  <Image
                    src="/images/ceo/ceo-quality-assured.png"
                    alt="Hamim Banga"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-body font-semibold text-deep text-sm">{t('founderName')}</p>
                  <p className="font-body text-deep/50 text-xs">{t('founderTitle')}</p>
                </div>
              </footer>
            </blockquote>

            <Link
              href="/notre-histoire"
              className="inline-flex items-center gap-2 mt-8 px-7 py-3.5 bg-deep hover:bg-deep/85 text-white font-body font-semibold rounded-full transition-colors duration-200"
            >
              {ts('ourStory')} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
