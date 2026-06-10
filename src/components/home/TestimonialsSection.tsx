import { getTranslations } from 'next-intl/server';
import { Star } from 'lucide-react';
import SectionTitle from '@/components/ui/SectionTitle';

const TESTIMONIALS = [
  {
    name: 'Amina K.',
    location: 'Kigali, Rwanda',
    avatar: '/images/models/avatar-glowing-with-malkia.png',
    rating: 5,
    product: 'Biovène Éclat Suprême',
    key: 'review1',
  },
  {
    name: 'Fatou M.',
    location: 'Bukavu, DRC',
    avatar: '/images/models/avatar-feel-malkia.png',
    rating: 5,
    product: 'Malkia Intense Parfum',
    key: 'review2',
  },
  {
    name: 'Grace N.',
    location: 'Kigali, Rwanda',
    avatar: '/images/models/avatar-beauty-origins-here.png',
    rating: 5,
    product: 'AHA Body Lotion 3 Days',
    key: 'review3',
  },
];

export default async function TestimonialsSection() {
  const t  = await getTranslations('testimonials');
  const ts = await getTranslations('sections');

  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          accent={`✨ ${ts('shinning')}`}
          title={ts('testimonials')}
          subtitle={ts('testimonialsSubtitle')}
        />

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, location, avatar, rating, product, key }, i) => (
            <div
              key={key}
              className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_36px_rgba(201,168,76,0.15)] transition-shadow duration-300 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>

              {/* Review text */}
              <p className="font-body text-deep/70 leading-relaxed flex-1 italic mb-5">
                &ldquo;{t(key as 'review1')}&rdquo;
              </p>

              {/* Product tag */}
              <span className="inline-flex self-start px-3 py-1 bg-soft-pink text-gold-dark text-[10px] font-body font-semibold rounded-full mb-4">
                {product}
              </span>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-deep/8">
                <div className="w-10 h-10 rounded-full overflow-hidden relative flex-shrink-0 bg-soft-pink">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-body font-semibold text-deep text-sm">{name}</p>
                  <p className="font-body text-deep/45 text-xs">{location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary bar */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 py-8 border-t border-b border-gold/15">
          {[
            { value: '500+', label: t('ordersLabel') },
            { value: '4.9/5', label: t('ratingLabel') },
            { value: '2015', label: t('sinceLabel') },
            { value: '2', label: t('storesLabel') },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-heading text-3xl md:text-4xl text-deep font-bold">{value}</p>
              <p className="font-body text-deep/50 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
