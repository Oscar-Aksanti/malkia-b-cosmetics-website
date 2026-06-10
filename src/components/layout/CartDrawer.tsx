'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '@/store/CartContext';
import { Link } from '@/i18n/navigation';
import { generateOrderMessage, openWhatsApp } from '@/lib/whatsapp';
import { logOrderAttempt } from '@/lib/supabase';
import { getDeviceType } from '@/lib/whatsapp';
import type { Locale } from '@/types';

export default function CartDrawer() {
  const t      = useTranslations();
  const locale = useLocale() as Locale;
  const { items, isOpen, closeCart, removeItem, updateQty, clearCart, cartTotal } = useCart();

  const handleCheckout = async () => {
    if (!items.length) return;
    const message = generateOrderMessage(items, locale);
    // Log to Supabase (fire-and-forget)
    logOrderAttempt({
      items: items.map((i) => ({
        product_code: i.product_code,
        name: i.name,
        quantity: i.quantity,
        price_usd: i.price_usd,
      })),
      total_usd: cartTotal,
      language: locale,
      device: getDeviceType(),
      status: 'pending',
    });
    openWhatsApp(message);
    closeCart();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-deep/50 backdrop-blur-sm"
          />

          {/* Drawer — slides from right on desktop, up from bottom on mobile */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] bg-cream shadow-2xl flex flex-col"
          >
            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gold/15">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gold" />
                <h2 className="font-heading text-xl text-deep">{t('cart.title')}</h2>
                {items.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-fuchsia text-white text-xs font-bold rounded-full">
                    {items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-full hover:bg-gold/10 text-deep/60 hover:text-deep transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Items ───────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <ShoppingBag className="w-16 h-16 text-gold/30 mb-4" />
                  <p className="font-heading text-xl text-deep/50 mb-2">{t('cart.empty')}</p>
                  <p className="font-body text-sm text-deep/35 mb-6">{t('cart.emptySubtitle')}</p>
                  <Link
                    href="/produits"
                    onClick={closeCart}
                    className="px-6 py-3 bg-gold hover:bg-gold-dark text-deep font-body font-semibold rounded-full text-sm transition-colors"
                  >
                    {t('cart.browsProducts')}
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    className="flex gap-4 bg-white rounded-2xl p-3 shadow-sm"
                  >
                    {/* Image */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-soft-pink">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-gold/40" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-body text-gold/80 font-semibold uppercase tracking-wide">
                        {item.product_code}
                      </p>
                      <p className="font-heading text-sm text-deep leading-snug line-clamp-2 mt-0.5">
                        {item.name}
                      </p>
                      <p className="font-body font-bold text-deep mt-1">
                        ${(item.price_usd * item.quantity).toFixed(2)} USD
                      </p>

                      {/* Qty controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full border border-gold/30 hover:bg-gold/10 flex items-center justify-center text-deep/60 hover:text-deep transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-body font-semibold text-sm text-deep w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full border border-gold/30 hover:bg-gold/10 flex items-center justify-center text-deep/60 hover:text-deep transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto p-1.5 rounded-full hover:bg-red-50 text-deep/30 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* ── Footer ──────────────────────────────────────────────── */}
            {items.length > 0 && (
              <div className="border-t border-gold/15 px-5 py-5 space-y-3">
                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="font-body text-deep/60">{t('cart.total')}</span>
                  <span className="font-heading text-2xl text-deep font-bold">
                    ${cartTotal.toFixed(2)} <span className="text-sm font-body font-normal text-deep/50">USD</span>
                  </span>
                </div>

                {/* WhatsApp CTA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-whatsapp hover:bg-whatsapp-dark text-white font-body font-semibold rounded-2xl text-base shadow-[0_4px_20px_rgba(37,211,102,0.35)] transition-colors"
                >
                  <FaWhatsapp className="w-5 h-5" />
                  {t('cart.checkout')}
                </motion.button>

                {/* Clear */}
                <button
                  onClick={clearCart}
                  className="w-full py-2 text-deep/40 hover:text-deep/60 font-body text-sm transition-colors"
                >
                  {t('cart.continueShopping')}
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
