'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FaInstagram } from 'react-icons/fa';

export default function FooterNewsletter() {
  const t = useTranslations('footer');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div>
      <h4 className="font-heading text-lg text-gold mb-2">
        {t('newsletter.title')}
      </h4>
      <p className="font-body text-sm text-white/50 mb-5">
        {t('newsletter.subtitle')}
      </p>

      {submitted ? (
        <p className="font-body text-sm text-green-400 py-3">✓ {t('newsletter.success')}</p>
      ) : (
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder={t('newsletter.placeholder')}
            className="w-full px-4 py-3 rounded-xl bg-white/8 border border-white/12 text-white placeholder-white/35 font-body text-sm focus:outline-none focus:border-gold/60 transition-colors"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gold hover:bg-gold-dark text-deep font-body font-semibold text-sm transition-colors duration-200"
          >
            {t('newsletter.button')}
          </button>
        </form>
      )}

      {/* Instagram handle */}
      <div className="mt-5 flex items-center gap-2">
        <FaInstagram className="w-4 h-4 text-gold" />
        <a
          href="https://instagram.com/malkiabcosmetics"
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-sm text-white/50 hover:text-gold transition-colors"
        >
          @malkiabcosmetics
        </a>
      </div>
    </div>
  );
}
