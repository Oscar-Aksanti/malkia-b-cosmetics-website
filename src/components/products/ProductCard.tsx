'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Check } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '@/store/CartContext';
import { generateOrderMessage, openWhatsApp } from '@/lib/whatsapp';
import type { Product, Locale } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const t      = useTranslations();
  const locale = useLocale() as Locale;
  const { addItem, openCart } = useCart();
  const [added, setAdded] = useState(false);

  const name = locale === 'fr' ? product.name_fr : product.name_en;

  const handleAddToCart = () => {
    addItem({
      id:           product.id,
      product_code: product.product_code,
      name,
      price_usd:    product.price_usd,
      quantity:     1,
      image:        product.images[0],
    });
    setAdded(true);
    setTimeout(() => { setAdded(false); openCart(); }, 800);
  };

  const handleQuickOrder = () => {
    const item = {
      id: product.id, product_code: product.product_code,
      name, price_usd: product.price_usd, quantity: 1, image: product.images[0],
    };
    openWhatsApp(generateOrderMessage([item], locale));
  };

  const categoryLabel: Record<string, Record<Locale, string>> = {
    body:      { fr: 'Corps',     en: 'Body'       },
    face:      { fr: 'Visage',    en: 'Face'       },
    fragrance: { fr: 'Parfums',   en: 'Fragrance'  },
    wellness:  { fr: 'Bien-être', en: 'Wellness'   },
  };

  const stockColors: Record<string, string> = {
    in_stock:   'text-green-600',
    low_stock:  'text-amber-600',
    out_of_stock:'text-red-500',
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_36px_rgba(201,168,76,0.18)] transition-shadow duration-300 flex flex-col will-change-transform"
    >
      {/* ── Image ─────────────────────────────────────────────────────── */}
      <Link href={`/produits/${product.slug}`} className="block relative aspect-square overflow-hidden group bg-soft-pink">
        <Image
          src={product.images[0] || '/images/logos/logo-simplified.png'}
          alt={name}
          fill
          className="object-cover group-hover:scale-[1.08] transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          <span className="bg-gold/95 text-deep text-[10px] font-bold px-2 py-0.5 rounded-full font-body backdrop-blur-sm">
            {product.product_code}
          </span>
        </div>
        {product.is_featured && (
          <div className="absolute top-2.5 right-2.5">
            <span className="bg-fuchsia text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-body">
              {t('products.featured')}
            </span>
          </div>
        )}

        {/* Quick order overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-deep/75 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={(e) => { e.preventDefault(); handleQuickOrder(); }}
            className="w-full py-2.5 bg-whatsapp hover:bg-whatsapp-dark text-white text-xs font-body font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <FaWhatsapp className="w-3.5 h-3.5" />
            {t('products.quickOrder')}
          </button>
        </div>
      </Link>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-body uppercase tracking-widest text-gold/80 font-semibold">
            {categoryLabel[product.category]?.[locale]}
          </span>
          <span className={`text-[10px] font-body font-medium ${stockColors[product.stock_status]}`}>
            {product.stock_status === 'in_stock'    && t('products.inStock')    }
            {product.stock_status === 'low_stock'   && t('products.lowStock')   }
            {product.stock_status === 'out_of_stock'&& t('products.outOfStock') }
          </span>
        </div>

        <Link href={`/produits/${product.slug}`}>
          <h3 className="font-heading text-base md:text-lg text-deep leading-snug line-clamp-2 hover:text-gold-dark transition-colors">
            {name}
          </h3>
        </Link>

        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <div>
            <p className="font-body font-bold text-lg text-deep">
              ${product.price_usd.toFixed(0)}
              <span className="text-xs font-normal text-deep/45 ml-1">USD</span>
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={handleAddToCart}
            disabled={product.stock_status === 'out_of_stock'}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-body font-semibold transition-all duration-200 ${
              added
                ? 'bg-green-500 text-white'
                : product.stock_status === 'out_of_stock'
                  ? 'bg-deep/10 text-deep/35 cursor-not-allowed'
                  : 'bg-gold hover:bg-gold-dark text-deep shadow-sm'
            }`}
          >
            {added
              ? <><Check className="w-3.5 h-3.5" /> OK</>
              : <><ShoppingBag className="w-3.5 h-3.5" /> {t('products.addToCart')}</>
            }
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
