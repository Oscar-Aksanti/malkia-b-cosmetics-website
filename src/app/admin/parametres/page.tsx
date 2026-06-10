'use client';

import { useState, useEffect } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  FaWhatsapp, FaInstagram, FaFacebook, FaTiktok, FaYoutube, FaSnapchat,
} from 'react-icons/fa';
import { MapPin, Phone, Globe, Save, Check, Radio } from 'lucide-react';
import {
  getLiveSettings,
  saveLiveSettings,
  type LiveSettings,
} from '@/components/LiveIndicator';

interface SiteSettings {
  whatsapp_order:    string;
  whatsapp_rw:       string;
  whatsapp_drc:      string;
  address_kigali:    string;
  address_bukavu:    string;
  instagram:         string;
  facebook:          string;
  tiktok:            string;
  youtube:           string;
  snapchat:          string;
  announcement:      string;
  show_announcement: boolean;
}

const DEFAULT: SiteSettings = {
  whatsapp_order:    '+243 995 945 889',
  whatsapp_rw:       '+250 788 450 058',
  whatsapp_drc:      '+243 995 945 889',
  address_kigali:    'KN 119 St 29, Kigali, Rwanda — P.O.BOX 6950',
  address_bukavu:    'Grande Mosquée de Nyawera, Bukavu, DRCongo',
  instagram:         '@malkiabcosmetics',
  facebook:          '@malkiabcosmetics',
  tiktok:            '@malkiabcosmetics',
  youtube:           '@malkiabcosmetics',
  snapchat:          'malkiabcosmetic',
  announcement:      '🎉 Livraison gratuite dès 50$ · Free shipping from $50',
  show_announcement: false,
};

function Section({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-xl bg-[#C9A84C]/15 flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#C9A84C]" />
        </div>
        <h2 className="text-white font-semibold text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text', placeholder, prefix,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; prefix?: string;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="block text-white/40 text-xs font-medium uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="flex items-center">
        {prefix && (
          <span className="px-3 py-2.5 bg-white/8 border border-r-0 border-white/10 rounded-l-xl text-white/40 text-sm">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3.5 py-2.5 bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20
            focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/20 transition-all
            ${prefix ? 'rounded-r-xl' : 'rounded-xl'}`}
        />
      </div>
    </div>
  );
}

export default function AdminParametresPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT);
  const [live, setLive]         = useState<LiveSettings>({ active: false, platform: 'instagram', url: '' });
  const [saved, setSaved]       = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('malkia_site_settings');
    if (stored) {
      try { setSettings({ ...DEFAULT, ...JSON.parse(stored) }); } catch { /* ignore */ }
    }
    setLive(getLiveSettings());
  }, []);

  const set = (key: keyof SiteSettings) => (value: string | boolean) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    localStorage.setItem('malkia_site_settings', JSON.stringify(settings));
    saveLiveSettings(live);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#0D0D0D]">
        <AdminSidebar />

        <main className="flex-1 min-w-0 p-4 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-white text-2xl md:text-3xl font-bold">Paramètres</h1>
              <p className="text-white/40 text-sm mt-1">Configuration du site Malkia B Cosmetics</p>
            </div>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                saved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[#C9A84C] hover:bg-[#b8973d] text-[#0D0D0D]'
              }`}
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Sauvegardé !' : 'Sauvegarder'}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* WhatsApp & Téléphones */}
            <Section title="WhatsApp & Téléphones" icon={FaWhatsapp}>
              <Field
                label="Numéro commandes (principal)"
                value={settings.whatsapp_order}
                onChange={set('whatsapp_order')}
                placeholder="+243 995 945 889"
              />
              <Field
                label="Tel Rwanda"
                value={settings.whatsapp_rw}
                onChange={set('whatsapp_rw')}
                placeholder="+250 788 450 058"
              />
              <Field
                label="Tel DRCongo"
                value={settings.whatsapp_drc}
                onChange={set('whatsapp_drc')}
                placeholder="+243 995 945 889"
              />
            </Section>

            {/* Boutiques & Adresses */}
            <Section title="Boutiques & Adresses" icon={MapPin}>
              <Field
                label="Boutique Kigali, Rwanda 🇷🇼"
                value={settings.address_kigali}
                onChange={set('address_kigali')}
                placeholder="KN 119 St 29, Kigali, Rwanda"
              />
              <Field
                label="Boutique Bukavu, DRC 🇨🇩"
                value={settings.address_bukavu}
                onChange={set('address_bukavu')}
                placeholder="Grande Mosquée de Nyawera, Bukavu"
              />
            </Section>

            {/* Réseaux sociaux */}
            <Section title="Réseaux sociaux" icon={Globe}>
              <div className="space-y-3">
                {[
                  { key: 'instagram', icon: FaInstagram, label: 'Instagram',  color: '#E91E8C', prefix: 'instagram.com/' },
                  { key: 'facebook',  icon: FaFacebook,  label: 'Facebook',   color: '#1877F2', prefix: 'facebook.com/'  },
                  { key: 'tiktok',    icon: FaTiktok,    label: 'TikTok',     color: '#ffffff', prefix: 'tiktok.com/'    },
                  { key: 'youtube',   icon: FaYoutube,   label: 'YouTube',    color: '#FF0000', prefix: 'youtube.com/'   },
                  { key: 'snapchat',  icon: FaSnapchat,  label: 'Snapchat',   color: '#FFFC00', prefix: 'snapchat.com/add/' },
                ].map(({ key, icon: Icon, label, color, prefix }) => (
                  <div key={key}>
                    <label className="flex items-center gap-2 text-white/40 text-xs font-medium uppercase tracking-wider mb-1.5">
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                      {label}
                    </label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2.5 bg-white/5 border border-r-0 border-white/10 rounded-l-xl text-white/25 text-[10px] font-mono truncate max-w-[110px]">
                        {prefix}
                      </span>
                      <input
                        type="text"
                        value={settings[key as keyof SiteSettings] as string}
                        onChange={(e) => set(key as keyof SiteSettings)(e.target.value)}
                        placeholder={`@${key === 'snapchat' ? 'malkiabcosmetic' : 'malkiabcosmetics'}`}
                        className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-r-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#C9A84C]/50 transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Live Stream */}
            <Section title="🔴 Diffusion en direct (Live)" icon={Radio}>
              <p className="text-white/40 text-xs mb-4 leading-relaxed">
                Quand activé, un badge flottant apparaît sur toutes les pages du site pour rediriger les visiteurs vers votre live.
              </p>

              {/* Toggle */}
              <div className="flex items-center justify-between p-3 bg-white/3 border border-white/8 rounded-xl mb-4">
                <div>
                  <p className="text-white/70 text-sm font-medium">Afficher le badge &ldquo;LIVE&rdquo;</p>
                  <p className="text-white/30 text-xs">Visible sur toutes les pages du site</p>
                </div>
                <button
                  onClick={() => setLive((l) => ({ ...l, active: !l.active }))}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                    live.active ? 'bg-red-500' : 'bg-white/15'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    live.active ? 'translate-x-5' : ''
                  }`} />
                </button>
              </div>

              {/* Platform selector */}
              <div className="mb-4">
                <label className="block text-white/40 text-xs font-medium uppercase tracking-wider mb-2">
                  Plateforme
                </label>
                <div className="flex gap-2">
                  {([
                    { value: 'instagram', icon: FaInstagram, label: 'Instagram', color: '#E91E8C' },
                    { value: 'tiktok',    icon: FaTiktok,    label: 'TikTok',    color: '#ffffff' },
                  ] as const).map(({ value, icon: Icon, label, color }) => (
                    <button
                      key={value}
                      onClick={() => setLive((l) => ({ ...l, platform: value }))}
                      className={`flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        live.platform === value
                          ? 'bg-white/10 border-white/30 text-white'
                          : 'bg-white/3 border-white/8 text-white/40 hover:bg-white/8'
                      }`}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live URL */}
              <div>
                <label className="block text-white/40 text-xs font-medium uppercase tracking-wider mb-1.5">
                  Lien du live (URL)
                </label>
                <input
                  type="url"
                  value={live.url}
                  onChange={(e) => setLive((l) => ({ ...l, url: e.target.value }))}
                  placeholder="https://www.instagram.com/malkiabcosmetics/live/..."
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#C9A84C]/50 transition-all"
                />
              </div>

              {/* Preview badge */}
              {live.active && live.url && (
                <div className="mt-4 p-3 bg-white/3 border border-white/8 rounded-xl">
                  <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Aperçu du badge</p>
                  <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full text-white text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #E91E8C 0%, #ff5e7a 100%)' }}
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                    </span>
                    {live.platform === 'instagram'
                      ? <FaInstagram className="w-4 h-4" style={{ color: '#E91E8C' }} />
                      : <FaTiktok    className="w-4 h-4" />
                    }
                    LIVE sur {live.platform === 'instagram' ? 'Instagram' : 'TikTok'}
                  </div>
                </div>
              )}
            </Section>

            {/* Bannière d'annonce */}
            <Section title="Bannière d'annonce" icon={Phone}>
              <div className="mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`w-10 h-5 rounded-full transition-colors relative ${settings.show_announcement ? 'bg-[#C9A84C]' : 'bg-white/10'}`}
                    onClick={() => set('show_announcement')(!settings.show_announcement)}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.show_announcement ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-white/60 text-sm">Afficher la bannière</span>
                </label>
              </div>
              <div>
                <label className="block text-white/40 text-xs font-medium uppercase tracking-wider mb-1.5">
                  Texte de l&apos;annonce
                </label>
                <textarea
                  value={settings.announcement}
                  onChange={(e) => set('announcement')(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#C9A84C]/50 transition-all resize-none"
                  placeholder="Ex: Livraison gratuite dès 50$"
                />
              </div>
              {settings.show_announcement && settings.announcement && (
                <div className="mt-3 px-3 py-2 bg-[#C9A84C]/15 border border-[#C9A84C]/30 rounded-xl">
                  <p className="text-[#C9A84C] text-xs font-medium">Aperçu :</p>
                  <p className="text-white/80 text-xs mt-0.5">{settings.announcement}</p>
                </div>
              )}
            </Section>
          </div>

          {/* Supabase info */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-blue-400 text-xs font-medium mb-1">ℹ️ Configuration Supabase</p>
            <p className="text-blue-400/70 text-xs">
              Pour persister ces paramètres en base de données, configurez{' '}
              <code className="bg-white/10 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> et{' '}
              <code className="bg-white/10 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> dans votre{' '}
              <code className="bg-white/10 px-1 rounded">.env.local</code>.
            </p>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
