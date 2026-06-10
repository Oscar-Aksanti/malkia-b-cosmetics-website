import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import {
  FaInstagram, FaFacebook, FaTiktok, FaYoutube, FaWhatsapp, FaSnapchat,
} from 'react-icons/fa';
import { MapPin, Phone, Mail } from 'lucide-react';
import FooterNewsletter from './FooterNewsletter';

export default async function Footer() {
  const t = await getTranslations();

  const navLinks = [
    { href: '/',               label: t('nav.home')     },
    { href: '/produits',       label: t('nav.products') },
    { href: '/notre-histoire', label: t('nav.about')    },
    { href: '/boutiques',      label: t('nav.stores')   },
    { href: '/contact',        label: t('nav.contact')  },
  ];

  const socialLinks = [
    { href: 'https://instagram.com/malkiabcosmetics',          icon: FaInstagram, label: 'Instagram' },
    { href: 'https://facebook.com/malkiabcosmetics',           icon: FaFacebook,  label: 'Facebook'  },
    { href: 'https://tiktok.com/@malkiabcosmetics',            icon: FaTiktok,    label: 'TikTok'    },
    { href: 'https://youtube.com/@malkiabcosmetics',           icon: FaYoutube,   label: 'YouTube'   },
    { href: 'https://www.snapchat.com/add/malkiabcosmetic',    icon: FaSnapchat,  label: 'Snapchat'  },
    { href: 'https://wa.me/243995945889',                      icon: FaWhatsapp,  label: 'WhatsApp'  },
  ];

  return (
    <footer className="bg-deep text-white">
      {/* ── Gold divider ──────────────────────────────────────────────────── */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      {/* ── Main footer ───────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* ── Brand column ──────────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <Image
              src="/images/logos/logo-detailed.png"
              alt="Malkia B Cosmetics"
              width={100}
              height={100}
              className="h-20 w-auto object-contain mb-5"
            />
            <p className="font-accent text-gold text-lg leading-snug mb-3">
              &ldquo;{t('footer.tagline')}&rdquo;
            </p>
            <p className="text-white/50 text-xs font-body leading-relaxed mb-5">
              {t('footer.since')} · {t('footer.services')}
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-white/15 hover:border-gold hover:bg-gold/15 flex items-center justify-center text-white/60 hover:text-gold transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Quick links ───────────────────────────────────────────────── */}
          <div>
            <h4 className="font-heading text-lg text-gold mb-5">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="font-body text-sm text-white/60 hover:text-gold transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold/40 group-hover:bg-gold transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ───────────────────────────────────────────────────── */}
          <div>
            <h4 className="font-heading text-lg text-gold mb-5">
              {t('footer.contactTitle')}
            </h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                <span className="font-body text-sm text-white/60">
                  {t('footer.rwanda')}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                <span className="font-body text-sm text-white/60">
                  {t('footer.drc')}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                <a
                  href={`tel:${t('footer.phoneRwanda').replace(/\s/g, '')}`}
                  className="font-body text-sm text-white/60 hover:text-gold transition-colors"
                >
                  {t('footer.phoneRwanda')}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                <a
                  href={`tel:${t('footer.phoneDRC').replace(/\s/g, '')}`}
                  className="font-body text-sm text-white/60 hover:text-gold transition-colors"
                >
                  {t('footer.phoneDRC')}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                <a
                  href="mailto:info@malkiabcosmetics.com"
                  className="font-body text-sm text-white/60 hover:text-gold transition-colors"
                >
                  info@malkiabcosmetics.com
                </a>
              </li>
            </ul>
          </div>

          {/* ── Newsletter (client component for interactivity) ───────── */}
          <FooterNewsletter />
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────────────── */}
      <div className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs text-white/35 text-center sm:text-left">
            {t('footer.copyright')}
          </p>
          <p className="font-accent text-gold/70 text-sm">
            True Beauty Comes From Within
          </p>
        </div>
      </div>
    </footer>
  );
}
