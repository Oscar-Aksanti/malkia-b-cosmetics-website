'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import SectionTitle from '@/components/ui/SectionTitle';
import { ArrowRight } from 'lucide-react';

const CATEGORIES = [
  {
    key:   'body',
    image: '/images/products/almond-glow-korea-glow.png',
    href:  '/produits?cat=body',
    color: 'from-amber-900/70',
  },
  {
    key:   'face',
    image: '/images/products/banners/biovene-eclat-supreme-shop.png',
    href:  '/produits?cat=face',
    color: 'from-purple-900/70',
  },
  {
    key:   'fragrance',
    image: '/images/ceo/ceo-malkia-intense.png',
    href:  '/produits?cat=fragrance',
    color: 'from-fuchsia-900/70',
  },
  {
    key:   'wellness',
    image: '/images/models/avatar-flat-tummy-tea.png',
    href:  '/produits?cat=wellness',
    color: 'from-green-900/70',
  },
] as const;

export default function CategoriesSection() {
  const t = useTranslations('categories');
  const ts = useTranslations('sections');

  return (
    <section className="py-16 md:py-24 bg-deep">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title={ts('categories')}
          subtitle={ts('categoriesSubtitle')}
          light
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map(({ key, image, href, color }, i) => (
            <motion.div
              key={key}
              initial={{ y: 24 }}
              whileInView={{ y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              viewport={{ once: true, margin: '0px 0px -60px 0px' }}
            >
              <Link
                href={href}
                className="group block relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer"
              >
                <Image
                  src={image}
                  alt={t(key)}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${color} to-transparent`} />
                <div className="absolute inset-0 bg-gradient-to-t from-deep/80 via-transparent to-transparent" />

                <div className="absolute bottom-0 inset-x-0 p-4">
                  <p className="font-body text-xs text-gold/80 uppercase tracking-widest mb-1">
                    {t(`${key}Desc` as 'bodyDesc')}
                  </p>
                  <h3 className="font-heading text-xl md:text-2xl text-white group-hover:text-gold transition-colors duration-200">
                    {t(key)}
                  </h3>
                  <div className="flex items-center gap-1 mt-2 text-white/50 group-hover:text-gold/70 transition-colors">
                    <span className="font-body text-xs">Explorer</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
