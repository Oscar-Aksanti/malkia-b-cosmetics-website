import { getTranslations } from 'next-intl/server';
import { MapPin, Phone, Clock, ExternalLink } from 'lucide-react';
import SectionTitle from '@/components/ui/SectionTitle';
import { Link } from '@/i18n/navigation';

const STORES = [
  {
    key: 'kigali',
    city: 'Kigali',
    country: 'Rwanda',
    address: 'KN 119 St 29, Kigali, Rwanda',
    pobox: 'P.O.BOX 6950 Kigali',
    phone: '+250 788 450 058',
    flag: '🇷🇼',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.50!2d30.0444!3d-1.9706!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca6a05c4a6b7d%3A0x1a3e4f8b2c7d5e9f!2sNyamirambo%2C%20Kigali!5e0!3m2!1sen!2srw!4v1700000000000',
    mapsUrl: 'https://maps.google.com/?q=KN+119+St+29+Kigali+Rwanda',
    color: 'bg-gold',
  },
  {
    key: 'bukavu',
    city: 'Bukavu',
    country: 'DRCongo',
    address: 'Grande Mosquée de Nyawera, Bukavu',
    pobox: '',
    phone: '+243 995 945 889',
    flag: '🇨🇩',
    mapEmbed: 'https://maps.google.com/maps?q=Grande+Mosquée+Nyawera+Bukavu&output=embed',
    mapsUrl: 'https://maps.app.goo.gl/cvFg8Qn7MLnLUZq48',
    color: 'bg-fuchsia',
  },
] as const;

export default async function StoreLocator() {
  const t  = await getTranslations('stores');
  const ts = await getTranslations('sections');

  return (
    <section className="py-16 md:py-24 bg-deep">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          accent="📍 Nos boutiques"
          title={ts('stores')}
          subtitle={ts('storesSubtitle')}
          light
        />

        <div className="grid md:grid-cols-2 gap-8">
          {STORES.map(({ key, city, country, address, pobox, phone, flag, mapEmbed, mapsUrl, color }) => (
            <div key={key} className="bg-white/5 rounded-3xl overflow-hidden border border-white/10">

              {/* Map embed */}
              <div className="relative h-52 md:h-64 overflow-hidden">
                <iframe
                  src={mapEmbed}
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'grayscale(40%) contrast(1.1)' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map — ${city}`}
                />
                {/* City badge */}
                <div className={`absolute top-4 left-4 ${color} text-deep px-4 py-1.5 rounded-full flex items-center gap-2`}>
                  <span className="text-base">{flag}</span>
                  <span className="font-body font-bold text-sm">{city}</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-body font-semibold text-white text-sm">{address}</p>
                    {pobox && <p className="font-body text-white/40 text-xs mt-0.5">{pobox}</p>}
                    <p className="font-body text-white/50 text-xs mt-0.5">{country}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gold flex-shrink-0" />
                  <a
                    href={`tel:${phone.replace(/\s/g, '')}`}
                    className="font-body text-white/80 hover:text-gold transition-colors text-sm"
                  >
                    {phone}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gold flex-shrink-0" />
                  <p className="font-body text-white/60 text-sm">{t('hours')}</p>
                </div>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 border border-gold/50 text-gold hover:bg-gold hover:text-deep font-body font-semibold text-sm rounded-full transition-all duration-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t('getDirections')}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Worldwide delivery note */}
        <div className="mt-10 text-center">
          <p className="font-body text-white/50 text-sm">
            🌍 {t('worldwideNote')}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 mt-4 px-7 py-3 bg-gold hover:bg-gold/90 text-deep font-body font-semibold rounded-full transition-colors duration-200 text-sm"
          >
            {t('contactUs')} →
          </Link>
        </div>
      </div>
    </section>
  );
}
