'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { useCart } from '@/store/CartContext';
import { Home, Grid3X3, ShoppingBag, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileNav() {
  const t        = useTranslations('nav');
  const pathname = usePathname();
  const { cartCount, toggleCart } = useCart();

  const links = [
    { href: '/',         label: t('home'),     Icon: Home        },
    { href: '/produits', label: t('products'), Icon: Grid3X3     },
    { href: '/contact',  label: t('contact'),  Icon: Phone       },
  ] as const;

  const isActive = (href: string) =>
    href === '/' ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-cream/95 backdrop-blur-md border-t border-gold/15 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-sm mx-auto px-2">
        {links.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
              isActive(href) ? 'text-gold' : 'text-deep/50 hover:text-deep/80'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-body text-[10px] font-medium">{label}</span>
            {isActive(href) && (
              <motion.span
                layoutId="mobile-nav-dot"
                className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold rounded-full"
              />
            )}
          </Link>
        ))}

        {/* Cart button */}
        <button
          onClick={toggleCart}
          className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-deep/50 hover:text-deep/80 transition-all duration-200"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="font-body text-[10px] font-medium">{t('cart')}</span>
          {cartCount > 0 && (
            <motion.span
              key={cartCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1.5 right-2.5 w-4 h-4 bg-fuchsia text-white text-[9px] font-bold rounded-full flex items-center justify-center"
            >
              {cartCount > 9 ? '9+' : cartCount}
            </motion.span>
          )}
        </button>
      </div>
    </nav>
  );
}
