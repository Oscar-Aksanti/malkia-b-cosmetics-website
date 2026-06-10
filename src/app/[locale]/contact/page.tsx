'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Phone, MapPin, Send } from 'lucide-react';
import { FaWhatsapp, FaTiktok, FaYoutube, FaInstagram, FaFacebook } from 'react-icons/fa';
import { openWhatsApp } from '@/lib/whatsapp';

export default function ContactPage() {
  const t = useTranslations('contact');

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Redirect to WhatsApp with form content
    const msg = `Bonjour Malkia B Cosmetics ! 👋\n\nNom : ${form.name}\nEmail : ${form.email}\nTél : ${form.phone}\n\nMessage :\n${form.message}`;
    openWhatsApp(msg);
    setTimeout(() => { setSending(false); setSent(true); }, 500);
  };

  const SOCIALS = [
    { icon: FaInstagram, href: 'https://instagram.com/malkiabcosmetics', label: 'Instagram',  color: 'hover:text-fuchsia' },
    { icon: FaFacebook,  href: 'https://facebook.com/malkiabcosmetics',  label: 'Facebook',   color: 'hover:text-blue-500' },
    { icon: FaTiktok,    href: 'https://tiktok.com/@malkiabcosmetics',   label: 'TikTok',     color: 'hover:text-deep' },
    { icon: FaYoutube,   href: 'https://youtube.com/@malkiabcosmetics',  label: 'YouTube',    color: 'hover:text-red-500' },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-deep py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-accent text-gold text-xl mb-3">💬 Parlons</p>
          <h1 className="font-heading text-4xl md:text-6xl text-white mb-4">{t('title')}</h1>
          <p className="font-body text-white/50 text-lg">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12">

          {/* ── Form ──────────────────────────────────────────────────── */}
          <motion.div
            initial={{ x: -24 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading text-2xl text-deep mb-6">{t('send')}</h2>

            {sent ? (
              <div className="bg-green-50 rounded-2xl p-8 text-center">
                <p className="text-4xl mb-4">✅</p>
                <p className="font-heading text-xl text-green-700 mb-2">{t('success')}</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }); }}
                  className="font-body text-sm text-green-600 underline mt-2"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { key: 'name',    type: 'text',  required: true  },
                  { key: 'email',   type: 'email', required: true  },
                  { key: 'phone',   type: 'tel',   required: false },
                ].map(({ key, type, required }) => (
                  <div key={key}>
                    <label className="block font-body text-sm font-medium text-deep/70 mb-1.5">
                      {t(key as 'name')} {required && <span className="text-fuchsia">*</span>}
                    </label>
                    <input
                      type={type}
                      required={required}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-deep/10 rounded-xl font-body text-sm text-deep placeholder:text-deep/30 focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20 transition-all"
                    />
                  </div>
                ))}

                <div>
                  <label className="block font-body text-sm font-medium text-deep/70 mb-1.5">
                    {t('message')} <span className="text-fuchsia">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-deep/10 rounded-xl font-body text-sm text-deep placeholder:text-deep/30 focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20 transition-all resize-none"
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gold hover:bg-gold-dark text-deep font-body font-semibold rounded-full transition-colors duration-200 disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  {sending ? '...' : t('send')}
                </motion.button>

                <p className="font-body text-xs text-deep/40 text-center">
                  {t('whatsappCta')}
                </p>
              </form>
            )}
          </motion.div>

          {/* ── Contact info ───────────────────────────────────────────── */}
          <motion.div
            initial={{ x: 24 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="space-y-6"
          >
            {/* WhatsApp CTA */}
            <div className="bg-whatsapp/10 border border-whatsapp/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <FaWhatsapp className="w-8 h-8 text-whatsapp" />
                <div>
                  <p className="font-body font-semibold text-deep">WhatsApp</p>
                  <p className="font-body text-sm text-deep/50">Canal de vente principal</p>
                </div>
              </div>
              <a
                href="https://wa.me/243971601855"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-whatsapp hover:bg-whatsapp-dark text-white font-body font-semibold rounded-xl transition-colors duration-200"
              >
                <FaWhatsapp className="w-4 h-4" />
                Commander via WhatsApp
              </a>
            </div>

            {/* Phones */}
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-heading text-lg text-deep">Téléphone</h3>
              {[
                { label: t('rwanda'), phone: '+250 788 450 058', flag: '🇷🇼' },
                { label: t('drc'),    phone: '+243 995 945 889', flag: '🇨🇩' },
              ].map(({ label, phone, flag }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-2xl">{flag}</span>
                  <div>
                    <p className="font-body text-xs text-deep/50">{label}</p>
                    <a
                      href={`tel:${phone.replace(/\s/g, '')}`}
                      className="font-body font-semibold text-deep hover:text-gold transition-colors text-sm"
                    >
                      {phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Addresses */}
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-heading text-lg text-deep">Boutiques</h3>
              {[
                { label: 'Kigali, Rwanda',   address: 'Nyamirambo-Kigali', flag: '🇷🇼' },
                { label: 'Bukavu, DRCongo',  address: 'Mosquée Nyawera-Bukavu', flag: '🇨🇩' },
              ].map(({ label, address, flag }) => (
                <div key={label} className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-body font-semibold text-deep text-sm">{flag} {label}</p>
                    <p className="font-body text-deep/50 text-xs">{address}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Socials */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-heading text-lg text-deep mb-4">@malkiabcosmetics</h3>
              <div className="flex gap-3">
                {SOCIALS.map(({ icon: Icon, href, label, color }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`w-10 h-10 rounded-xl bg-deep/5 flex items-center justify-center text-deep/60 ${color} transition-colors duration-200`}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
