import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { MapPin, Phone, Clock, ExternalLink, Globe } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'stores' });
  return { title: t('title'), description: t('subtitle') };
}

const STORES = [
  {
    key: 'kigali',
    title: 'Boutique Kigali',
    city: 'Kigali',
    country: 'Rwanda',
    flag: '🇷🇼',
    address: 'Nyamirambo-Kigali, Rwanda',
    phone: '+250 788 450 058',
    hours: 'Lun – Sam : 8h00 – 20h00',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.50!2d30.0444!3d-1.9706!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca6a05c4a6b7d%3A0x1a3e4f8b2c7d5e9f!2sNyamirambo%2C%20Kigali!5e0!3m2!1sfr!2srw!4v1700000000000',
    mapsUrl: 'https://maps.google.com/?q=Nyamirambo,Kigali,Rwanda',
    waPhone: '250788450058',
    color: 'bg-gold',
    textColor: 'text-deep',
  },
  {
    key: 'bukavu',
    title: 'Boutique Bukavu',
    city: 'Bukavu',
    country: 'DRCongo',
    flag: '🇨🇩',
    address: 'Mosquée Nyawera-Bukavu, DRCongo',
    phone: '+243 995 945 889',
    hours: 'Lun – Sam : 8h00 – 20h00',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.8!2d28.8487!3d-2.4917!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19c1b7a07a4e1b4d%3A0x9c4b8e2d3f1a5c7e!2sBukavu%2C%20DRC!5e0!3m2!1sfr!2scd!4v1700000000001',
    mapsUrl: 'https://maps.google.com/?q=Nyawera+Mosque,Bukavu,DRC',
    waPhone: '243995945889',
    color: 'bg-fuchsia',
    textColor: 'text-white',
  },
] as const;

export default async function BoutiquesPage() {
  const t = await getTranslations('stores');

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-deep py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-accent text-gold text-xl mb-3">📍 Nos adresses</p>
          <h1 className="font-heading text-4xl md:text-6xl text-white mb-4">{t('title')}</h1>
          <p className="font-body text-white/50 text-lg">{t('subtitle')}</p>
        </div>
      </div>

      {/* Stores */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-16">
        {STORES.map(({ key, title, city, country, flag, address, phone, hours, mapEmbed, mapsUrl, waPhone, color, textColor }) => (
          <div key={key} className="grid md:grid-cols-2 gap-8 items-center">
            {/* Map */}
            <div className="relative rounded-3xl overflow-hidden h-72 md:h-96 shadow-xl">
              <iframe
                src={mapEmbed}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Malkia B Cosmetics — ${city}`}
              />
              <div className={`absolute top-4 left-4 ${color} ${textColor} px-4 py-2 rounded-full flex items-center gap-2 shadow-md`}>
                <span className="text-lg">{flag}</span>
                <span className="font-body font-bold text-sm">{city}</span>
              </div>
            </div>

            {/* Info */}
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <h2 className="font-heading text-2xl md:text-3xl text-deep mb-2">{title}</h2>
              <p className="font-accent text-gold text-base mb-6">Beauty Specialists</p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="font-body font-semibold text-deep text-sm">Adresse</p>
                    <p className="font-body text-deep/60 text-sm">{address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="font-body font-semibold text-deep text-sm">Téléphone</p>
                    <a
                      href={`tel:${phone.replace(/\s/g, '')}`}
                      className="font-body text-deep/60 text-sm hover:text-gold transition-colors"
                    >
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="font-body font-semibold text-deep text-sm">Horaires</p>
                    <p className="font-body text-deep/60 text-sm">{hours}</p>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-3">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 border-2 border-gold text-gold hover:bg-gold hover:text-deep font-body font-semibold rounded-full transition-all duration-200 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Voir l&apos;itinéraire
                </a>
                <a
                  href={`https://wa.me/${waPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 bg-whatsapp hover:bg-whatsapp-dark text-white font-body font-semibold rounded-full transition-colors duration-200 text-sm"
                >
                  <FaWhatsapp className="w-4 h-4" />
                  Contacter via WhatsApp
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Worldwide delivery */}
      <section className="py-16 bg-deep text-center">
        <div className="max-w-2xl mx-auto px-4">
          <Globe className="w-12 h-12 text-gold mx-auto mb-4" />
          <h2 className="font-heading text-3xl text-white mb-3">Livraison Mondiale</h2>
          <p className="font-body text-white/60 mb-6">
            Vous n&apos;êtes pas au Rwanda ou en RDC ? Pas de problème. Nous livrons dans le monde entier. Commandez via WhatsApp et nous vous guiderons pour la livraison.
          </p>
          <a
            href="https://wa.me/243971601855"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-whatsapp hover:bg-whatsapp-dark text-white font-body font-semibold rounded-full transition-colors duration-200"
          >
            <FaWhatsapp className="w-5 h-5" />
            Commander via WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
