'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { getProducts, syncProductsFromDB, PRODUCTS_CHANGED_EVENT } from '@/lib/products-storage';
import type { Category, Product } from '@/types';

const CATEGORIES: { key: 'all' | Category; label_fr: string; label_en: string }[] = [
  { key: 'all',       label_fr: 'Tous',      label_en: 'All'         },
  { key: 'body',      label_fr: 'Corps',      label_en: 'Body Care'   },
  { key: 'face',      label_fr: 'Visage',     label_en: 'Face Care'   },
  { key: 'fragrance', label_fr: 'Parfums',    label_en: 'Fragrances'  },
  { key: 'wellness',  label_fr: 'Bien-être',  label_en: 'Wellness'    },
];

type SortOption = 'popular' | 'newest' | 'price_asc' | 'price_desc';

export default function ProduitsPage() {
  const t = useTranslations('products');
  const tCats = useTranslations('categories');

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | Category>('all');
  const [sort, setSort] = useState<SortOption>('popular');
  const [showFilters, setShowFilters] = useState(false);

  // Hydrate from localStorage, then fetch fresh from Supabase
  useEffect(() => {
    setAllProducts(getProducts());
    syncProductsFromDB().then((fresh) => { if (fresh.length > 0) setAllProducts(fresh); });
    const onChanged = (e: Event) => {
      const d = (e as CustomEvent<Product[]>).detail;
      if (d) setAllProducts(d);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'malkia_products') setAllProducts(getProducts());
    };
    window.addEventListener(PRODUCTS_CHANGED_EVENT, onChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(PRODUCTS_CHANGED_EVENT, onChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const filtered = useMemo(() => {
    let products = [...allProducts];

    // Category filter
    if (activeCategory !== 'all') {
      products = products.filter((p) => p.category === activeCategory);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name_fr.toLowerCase().includes(q) ||
          p.name_en.toLowerCase().includes(q) ||
          p.product_code.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sort) {
      case 'price_asc':  products.sort((a, b) => a.price_usd - b.price_usd);   break;
      case 'price_desc': products.sort((a, b) => b.price_usd - a.price_usd);   break;
      case 'newest':     products.sort((a, b) => b.id.localeCompare(a.id));     break;
      case 'popular':
      default:
        products.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    return products;
  }, [allProducts, search, activeCategory, sort]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Page header */}
      <div className="bg-deep py-14 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-fuchsia/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <p className="font-accent text-gold text-lg mb-2">✨ Malkia B Cosmetics</p>
          <h1 className="font-heading text-4xl md:text-6xl text-white leading-tight mb-4">
            {t('filterAll')}
          </h1>
          <p className="font-body text-white/50 text-base">
            {filtered.length} produit{filtered.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-deep/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-10 py-3 bg-white border border-deep/10 rounded-full font-body text-sm text-deep placeholder:text-deep/35 focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-deep/40 hover:text-deep transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-4 py-3 bg-white border border-deep/10 rounded-full font-body text-sm text-deep focus:outline-none focus:border-gold/50 cursor-pointer"
          >
            <option value="popular">{t('sortPopular')}</option>
            <option value="newest">{t('sortNewest')}</option>
            <option value="price_asc">{t('sortPriceAsc')}</option>
            <option value="price_desc">{t('sortPriceDesc')}</option>
          </select>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(({ key, label_fr }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-5 py-2 rounded-full font-body text-sm font-medium transition-all duration-200 ${
                activeCategory === key
                  ? 'bg-gold text-deep shadow-md scale-105'
                  : 'bg-white text-deep/60 hover:text-deep border border-deep/10 hover:border-gold/40'
              }`}
            >
              {label_fr}
            </button>
          ))}
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24"
            >
              <p className="font-heading text-2xl text-deep/40 mb-2">{t('noProducts')}</p>
              <button
                onClick={() => { setSearch(''); setActiveCategory('all'); }}
                className="font-body text-sm text-gold hover:underline mt-2"
              >
                Réinitialiser les filtres
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ y: 16 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
