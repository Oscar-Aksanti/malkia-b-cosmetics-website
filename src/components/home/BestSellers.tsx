'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getFeaturedProducts, PRODUCTS_CHANGED_EVENT } from '@/lib/products-storage';
import { FEATURED_PRODUCTS } from '@/lib/products-data';
import type { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import SectionTitle from '@/components/ui/SectionTitle';
import { Link } from '@/i18n/navigation';

export default function BestSellers() {
  const t    = useTranslations('sections');
  const tNav = useTranslations('products');

  // Start with static seed so SSR/first paint has content,
  // then replace with localStorage data on the client.
  const [featured, setFeatured] = useState<Product[]>(FEATURED_PRODUCTS);

  useEffect(() => {
    const stored = getFeaturedProducts();
    if (stored.length > 0) setFeatured(stored);

    const onChanged = (e: Event) => {
      const all = (e as CustomEvent<Product[]>).detail;
      if (all) setFeatured(all.filter((p) => p.is_featured && p.is_active));
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'malkia_products') {
        const stored2 = getFeaturedProducts();
        if (stored2.length > 0) setFeatured(stored2);
      }
    };
    window.addEventListener(PRODUCTS_CHANGED_EVENT, onChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(PRODUCTS_CHANGED_EVENT, onChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          accent="✨ Best-Sellers"
          title={t('bestSellers')}
          subtitle={t('bestSellersSubtitle')}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-10 md:mt-14 text-center">
          <Link
            href="/produits"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gold text-gold hover:bg-gold hover:text-deep font-body font-semibold rounded-full transition-all duration-200"
          >
            {tNav('filterAll')} →
          </Link>
        </div>
      </div>
    </section>
  );
}
