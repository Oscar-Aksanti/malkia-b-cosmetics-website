'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ShoppingBag, Check, ChevronLeft, Star, Package, Truck, HeartHandshake } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '@/store/CartContext';
import { generateOrderMessage, openWhatsApp } from '@/lib/whatsapp';
import ProductCard from './ProductCard';
import type { Product, Locale } from '@/types';

interface Props {
  product: Product;
  related: Product[];
  locale: Locale;
}

export default function ProductDetail({ product, related, locale }: Props) {
  const t = useTranslations('products');
  const { addItem, openCart } = useCart();

  const name = locale === 'fr' ? product.name_fr : product.name_en;
  const description = locale === 'fr' ? product.description_fr : product.description_en;

  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const categoryLabel: Record<string, Record<Locale, string>> = {
    body:      { fr: 'Corps',     en: 'Body'      },
    face:      { fr: 'Visage',    en: 'Face'      },
    fragrance: { fr: 'Parfums',   en: 'Fragrance' },
    wellness:  { fr: 'Bien-être', en: 'Wellness'  },
  };

  const stockColors: Record<string, string> = {
    in_stock:    'text-green-600 bg-green-50',
    low_stock:   'text-amber-600 bg-amber-50',
    out_of_stock:'text-red-500 bg-red-50',
  };

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addItem({
        id:           product.id,
        product_code: product.product_code,
        name,
        price_usd:    product.price_usd,
        quantity:     1,
        image:        product.images[0],
      });
    }
    setAdded(true);
    setTimeout(() => { setAdded(false); openCart(); }, 800);
  };

  const handleWhatsApp = () => {
    const items = [{ id: product.id, product_code: product.product_code, name, price_usd: product.price_usd, quantity: qty, image: product.images[0] }];
    openWhatsApp(generateOrderMessage(items, locale));
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link
          href="/produits"
          className="inline-flex items-center gap-1.5 font-body text-sm text-deep/50 hover:text-deep transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('filterAll')}
        </Link>
      </div>

      {/* Main product section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Images ─────────────────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-soft-pink">
              <motion.div
                key={selectedImage}
                initial={{ scale: 1.04 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <Image
                  src={product.images[selectedImage] || '/images/logos/logo-simplified.png'}
                  alt={name}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </motion.div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="bg-gold/95 text-deep text-xs font-bold px-3 py-1 rounded-full font-body">
                  {product.product_code}
                </span>
                {product.is_featured && (
                  <span className="bg-fuchsia text-white text-xs font-bold px-3 py-1 rounded-full font-body">
                    {t('featured')}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      i === selectedImage ? 'border-gold shadow-md' : 'border-transparent opacity-60 hover:opacity-90'
                    }`}
                  >
                    <Image src={img} alt={`${name} ${i + 1}`} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ────────────────────────────────────────────────────── */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-body text-xs uppercase tracking-widest text-gold/80 font-semibold">
                {categoryLabel[product.category]?.[locale]}
              </span>
              <span className="w-1 h-1 rounded-full bg-deep/20" />
              <span className={`font-body text-xs font-medium px-2 py-0.5 rounded-full ${stockColors[product.stock_status]}`}>
                {product.stock_status === 'in_stock'    && t('inStock')    }
                {product.stock_status === 'low_stock'   && t('lowStock')   }
                {product.stock_status === 'out_of_stock'&& t('outOfStock') }
              </span>
            </div>

            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-deep leading-tight mb-3">
              {name}
            </h1>

            {/* Stars placeholder */}
            <div className="flex items-center gap-1 mb-4">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-gold text-gold" />
              ))}
              <span className="font-body text-xs text-deep/40 ml-1">(4.9)</span>
            </div>

            <div className="h-px w-12 bg-gradient-to-r from-gold to-fuchsia mb-5" />

            {/* Description */}
            {description && (
              <p className="font-body text-deep/65 leading-relaxed mb-6">{description}</p>
            )}

            {/* Price */}
            <div className="flex items-end gap-2 mb-6">
              <p className="font-heading text-4xl text-deep font-bold">
                ${product.price_usd.toFixed(0)}
              </p>
              <span className="font-body text-deep/40 text-sm mb-1">USD</span>
            </div>

            {/* Quantity */}
            {product.stock_status !== 'out_of_stock' && (
              <div className="flex items-center gap-4 mb-6">
                <span className="font-body text-sm text-deep/60">{t('quantity')}</span>
                <div className="flex items-center border border-deep/15 rounded-full overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-4 py-2.5 font-body text-deep hover:bg-soft-pink transition-colors"
                  >
                    −
                  </button>
                  <span className="px-5 py-2.5 font-body font-semibold text-deep text-sm min-w-[3rem] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="px-4 py-2.5 font-body text-deep hover:bg-soft-pink transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleAddToCart}
                disabled={product.stock_status === 'out_of_stock'}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-body font-semibold transition-all duration-200 ${
                  added
                    ? 'bg-green-500 text-white'
                    : product.stock_status === 'out_of_stock'
                      ? 'bg-deep/10 text-deep/35 cursor-not-allowed'
                      : 'bg-gold hover:bg-gold-dark text-deep shadow-md'
                }`}
              >
                {added ? <><Check className="w-5 h-5" /> OK</> : <><ShoppingBag className="w-5 h-5" /> {t('addToCart')}</>}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full bg-whatsapp hover:bg-whatsapp-dark text-white font-body font-semibold transition-colors duration-200 shadow-md"
              >
                <FaWhatsapp className="w-5 h-5" />
                {t('orderWhatsApp')}
              </motion.button>
            </div>

            {/* Trust signals */}
            <div className="space-y-3 py-6 border-t border-deep/8">
              {[
                { icon: Package,       text: locale === 'fr' ? 'Emballage soigné, discret et sécurisé' : 'Careful, discreet and secure packaging' },
                { icon: Truck,         text: locale === 'fr' ? 'Livraison mondiale disponible' : 'Worldwide delivery available' },
                { icon: HeartHandshake,text: locale === 'fr' ? 'Service après-vente disponible' : 'After-sale service available' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-gold flex-shrink-0" />
                  <p className="font-body text-sm text-deep/60">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-deep/8" />
              <h2 className="font-heading text-2xl text-deep">{t('relatedProducts')}</h2>
              <div className="h-px flex-1 bg-deep/8" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
