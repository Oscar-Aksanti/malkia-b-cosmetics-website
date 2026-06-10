'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { generateGreetingMessage, openWhatsApp } from '@/lib/whatsapp';
import type { Locale } from '@/types';

export default function WhatsAppButton() {
  const locale = useLocale() as Locale;
  const t      = useTranslations('whatsapp');
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    const msg = generateGreetingMessage(locale);
    openWhatsApp(msg);
  };

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center gap-3">
      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0,  scale: 1    }}
            exit={{   opacity: 0, x: 10, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="bg-deep text-white text-sm font-body font-medium px-4 py-2 rounded-xl shadow-lg whitespace-nowrap pointer-events-none"
          >
            {t('tooltip')}
            {/* Arrow */}
            <span className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[7px] border-transparent border-l-deep" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button */}
      <motion.button
        onClick={handleClick}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label={t('tooltip')}
        className="wa-pulse relative w-14 h-14 sm:w-16 sm:h-16 bg-whatsapp hover:bg-whatsapp-dark rounded-full shadow-[0_4px_24px_rgba(37,211,102,0.45)] flex items-center justify-center text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2"
      >
        <FaWhatsapp className="w-7 h-7 sm:w-8 sm:h-8" />
      </motion.button>
    </div>
  );
}
