'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import SectionTitle from '@/components/ui/SectionTitle';

const GALLERY = [
  { src: '/images/models/avatar-your-beauty-our-priority.png', slogan: 'Your Beauty, Our Priority',     span: 'row-span-2' },
  { src: '/images/models/avatar-glowing-with-malkia.png',      slogan: 'Glowing with Malkia B',         span: '' },
  { src: '/images/models/avatar-feel-malkia.png',              slogan: 'Feel Malkia',                   span: '' },
  { src: '/images/models/avatar-beauty-origins-here.png',      slogan: 'Beauty Origins Here',           span: '' },
  { src: '/images/models/avatar-the-beauty-is-real.png',       slogan: 'The Beauty is Real',            span: '' },
  { src: '/images/models/avatar-orange-jacket.png',            slogan: 'True Beauty Comes From Within', span: '' },
];

export default function LifestyleGallery() {
  const t = useTranslations('sections');

  return (
    <section className="py-16 md:py-24 bg-deep">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          accent="Feel Malkia ✨"
          title={t('lifestyle')}
          subtitle={t('lifestyleSubtitle')}
          light
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {GALLERY.map(({ src, slogan, span }, i) => (
            <motion.div
              key={src}
              initial={{ scale: 0.97 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              viewport={{ once: true, margin: '0px 0px -40px 0px' }}
              className={`relative rounded-2xl overflow-hidden group cursor-pointer ${span || 'aspect-square'} ${span === 'row-span-2' ? 'row-span-2' : 'aspect-square'}`}
            >
              <Image
                src={src}
                alt={slogan}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-deep/80 via-deep/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                className="absolute bottom-0 inset-x-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
              >
                <p className="font-accent text-gold text-base leading-tight">
                  &ldquo;{slogan}&rdquo;
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
