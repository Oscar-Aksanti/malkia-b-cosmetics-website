import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Quote, Star, Award, Heart, Globe } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return { title: t('title'), description: t('tagline') };
}

export default async function NotrHistoirePage() {
  const t  = await getTranslations('about');
  const ts = await getTranslations('sections');

  const values = [
    { icon: Star,   key: 'quality'      as const },
    { icon: Heart,  key: 'authenticity' as const },
    { icon: Globe,  key: 'inclusivity'  as const },
  ];

  return (
    <div className="min-h-screen bg-cream">

      {/* Hero */}
      <section className="relative bg-deep py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/ceo/ceo-beauty-specialists.png"
            alt="Hamim Banga — CEO Malkia B Cosmetics"
            fill
            priority
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-deep via-deep/70 to-deep" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-accent text-gold text-xl mb-4">{ts('ourStory')}</p>
          <h1 className="font-heading text-5xl md:text-7xl text-white leading-tight mb-6">
            {t('tagline')}
          </h1>
          <p className="font-body text-white/60 text-lg">{t('subtitle')}</p>
        </div>
      </section>

      {/* Story + CEO */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-start">

            {/* CEO image column */}
            <div className="space-y-6 sticky top-24">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5]">
                <Image
                  src="/images/ceo/ceo-quality-assured.png"
                  alt="Hamim Banga — CEO"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep/60 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  {['Beauty Specialists', 'Your Skin Partners', 'Since 2015'].map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex mr-2 mb-2 px-3 py-1 bg-gold/90 text-deep text-xs font-bold rounded-full font-body"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Second CEO photo */}
              <div className="relative rounded-2xl overflow-hidden aspect-video">
                <Image
                  src="/images/ceo/ceo-malkia-intense.png"
                  alt="Malkia Intense — CEO"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Text column */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gold/20 overflow-hidden relative flex-shrink-0">
                  <Image src="/images/ceo/ceo-quality-assured.png" alt="Hamim Banga" fill className="object-cover" />
                </div>
                <div>
                  <p className="font-body font-bold text-deep">{t('founderName')}</p>
                  <p className="font-body text-deep/50 text-sm">{t('founderTitle')}</p>
                </div>
              </div>

              <h2 className="font-heading text-3xl md:text-4xl text-deep leading-tight mb-4">
                {ts('ourStorySubtitle')}
              </h2>
              <div className="h-px w-16 bg-gradient-to-r from-gold to-fuchsia mb-6" />

              <div className="space-y-5">
                {[t('story1'), t('story2'), t('story3')].map((text, i) => (
                  <p key={i} className="font-body text-deep/65 leading-relaxed text-base">{text}</p>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="mt-8 p-6 bg-soft-pink rounded-2xl border-l-4 border-gold relative overflow-hidden">
                <Quote className="absolute top-4 right-4 w-10 h-10 text-gold/15" />
                <p className="font-accent text-gold-dark text-xl leading-snug mb-4">
                  &ldquo;{t('founderQuote')}&rdquo;
                </p>
                <footer>
                  <p className="font-body font-semibold text-deep text-sm">{t('founderName')}</p>
                  <p className="font-body text-deep/50 text-xs">{t('founderTitle')}</p>
                </footer>
              </blockquote>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-10">
                {[
                  { value: '2015', label: t('founded') },
                  { value: '2', label: 'Boutiques' },
                  { value: '🌍', label: 'Worldwide' },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center p-4 bg-white rounded-2xl shadow-sm">
                    <p className="font-heading text-2xl text-deep font-bold">{value}</p>
                    <p className="font-body text-xs text-deep/50 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-deep">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="font-accent text-gold text-xl mb-3">— Our DNA —</p>
            <h2 className="font-heading text-3xl md:text-5xl text-white">Nos valeurs</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, key }) => (
              <div key={key} className="bg-white/5 rounded-2xl p-8 border border-white/8 text-center hover:bg-white/10 transition-colors duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gold/20 flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="font-heading text-xl text-white mb-3">{t(`values.${key}`)}</h3>
                <p className="font-body text-white/50 text-sm leading-relaxed">{t(`values.${key}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CEO Gallery */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl text-deep text-center mb-10">Beauty Specialists</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              '/images/ceo/ceo-beauty-specialists.png',
              '/images/ceo/ceo-anti-acne-set.png',
              '/images/ceo/ceo-biovene-eclat-supreme.png',
              '/images/ceo/ceo-la-tchadienne.png',
            ].map((src, i) => (
              <div key={i} className="relative rounded-2xl overflow-hidden aspect-square">
                <Image src={src} alt={`Hamim Banga ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-soft-pink">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="font-accent text-gold text-xl mb-3">True Beauty Comes From Within</p>
          <h2 className="font-heading text-3xl md:text-4xl text-deep mb-4">
            Découvrez notre collection
          </h2>
          <p className="font-body text-deep/60 mb-8">
            Des produits soigneusement sélectionnés pour sublimer votre beauté naturelle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/produits"
              className="px-8 py-4 bg-gold hover:bg-gold-dark text-deep font-body font-semibold rounded-full transition-colors duration-200"
            >
              Voir les produits →
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 border-2 border-deep text-deep hover:bg-deep hover:text-white font-body font-semibold rounded-full transition-all duration-200"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
