'use client';

import { useState } from 'react';
import Image from 'next/image';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { PRODUCTS as INITIAL_PRODUCTS } from '@/lib/products-data';
import type { Product } from '@/types';
import { Check, Plus, Edit2, X as XIcon, Save } from 'lucide-react';

const inputClass =
  'w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C9A84C]/50 transition-all placeholder:text-white/25';
const labelClass = 'block text-white/40 text-xs uppercase tracking-wider mb-1.5 font-medium';

interface SloganItem {
  id: number;
  text: string;
  editing: boolean;
  draft: string;
}

const INITIAL_SLOGANS: SloganItem[] = [
  { id: 1, text: 'Unlock Your Beauty From Within', editing: false, draft: '' },
  { id: 2, text: 'The Beauty is Real',             editing: false, draft: '' },
  { id: 3, text: 'Glowing with Malkia B',          editing: false, draft: '' },
  { id: 4, text: 'Feel Malkia',                    editing: false, draft: '' },
  { id: 5, text: 'Beauty Origins Here',            editing: false, draft: '' },
];

export default function AdminContenuPage() {
  // Hero texts
  const [heroFr1, setHeroFr1]       = useState('Votre Beauté,');
  const [heroFr2, setHeroFr2]       = useState('Notre Priorité');
  const [heroSubFr, setHeroSubFr]   = useState('True Beauty Comes From Within — Depuis 2015');
  const [heroEn1, setHeroEn1]       = useState('Your Beauty,');
  const [heroEn2, setHeroEn2]       = useState('Our Priority');
  const [heroSubEn, setHeroSubEn]   = useState('True Beauty Comes From Within — Since 2015');

  // Site-wide texts
  const [badge, setBadge]           = useState('Depuis 2015');
  const [cta1Fr, setCta1Fr]         = useState('Découvrir nos produits');
  const [cta2Fr, setCta2Fr]         = useState('Commander via WhatsApp');

  // Products for featuring
  const [products, setProducts]     = useState<Product[]>(INITIAL_PRODUCTS);

  // Slogans
  const [slogans, setSlogans]       = useState<SloganItem[]>(INITIAL_SLOGANS);
  const [nextId, setNextId]         = useState(INITIAL_SLOGANS.length + 1);

  // Save feedback
  const [saved, setSaved]           = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleFeatured = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_featured: !p.is_featured } : p))
    );
  };

  const startEditSlogan = (id: number) => {
    setSlogans((prev) =>
      prev.map((s) => (s.id === id ? { ...s, editing: true, draft: s.text } : s))
    );
  };

  const saveSlogan = (id: number) => {
    setSlogans((prev) =>
      prev.map((s) => (s.id === id && s.draft.trim() ? { ...s, text: s.draft.trim(), editing: false } : { ...s, editing: false }))
    );
  };

  const deleteSlogan = (id: number) => {
    setSlogans((prev) => prev.filter((s) => s.id !== id));
  };

  const addSlogan = () => {
    const id = nextId;
    setSlogans((prev) => [...prev, { id, text: 'Nouveau slogan', editing: true, draft: 'Nouveau slogan' }]);
    setNextId(id + 1);
  };

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#0D0D0D]">
        <AdminSidebar />

        <main className="flex-1 min-w-0 p-4 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-white text-2xl md:text-3xl font-bold">Contenu</h1>
              <p className="text-white/40 text-sm mt-1">Gérez les textes et produits vedettes du site</p>
            </div>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                saved
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#C9A84C] text-black hover:bg-[#C9A84C]/90'
              }`}
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Sauvegardé !' : 'Sauvegarder'}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* ── Hero Section ──────────────────────────────────────────── */}
            <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
              <h2 className="text-white font-semibold text-sm mb-4">Section Hero</h2>

              <div className="space-y-3 mb-5">
                <div>
                  <label className={labelClass}>Titre ligne 1 (FR)</label>
                  <input type="text" value={heroFr1} onChange={(e) => setHeroFr1(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Titre ligne 2 — fuchsia (FR)</label>
                  <input type="text" value={heroFr2} onChange={(e) => setHeroFr2(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Sous-titre (FR)</label>
                  <input type="text" value={heroSubFr} onChange={(e) => setHeroSubFr(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Title line 1 (EN)</label>
                  <input type="text" value={heroEn1} onChange={(e) => setHeroEn1(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Title line 2 — fuchsia (EN)</label>
                  <input type="text" value={heroEn2} onChange={(e) => setHeroEn2(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Subtitle (EN)</label>
                  <input type="text" value={heroSubEn} onChange={(e) => setHeroSubEn(e.target.value)} className={inputClass} />
                </div>
              </div>

              {/* Live preview */}
              <div className="rounded-xl bg-[#0D0D0D] border border-white/8 p-5">
                <p className="text-white/30 text-[10px] uppercase tracking-wider mb-3">Aperçu</p>
                <p className="text-white font-bold text-2xl leading-tight">
                  {heroFr1} <span style={{ color: '#E91E8C' }}>{heroFr2}</span>
                </p>
                <p className="text-white/50 text-xs mt-2">{heroSubFr}</p>
                <div className="flex gap-2 mt-4">
                  <span className="px-3 py-1.5 bg-[#C9A84C] text-black text-xs font-semibold rounded-lg">{cta1Fr}</span>
                  <span className="px-3 py-1.5 bg-[#25D366]/20 text-[#25D366] text-xs font-semibold rounded-lg border border-[#25D366]/30">{cta2Fr}</span>
                </div>
              </div>
            </div>

            {/* ── Textes du site ─────────────────────────────────────── */}
            <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
              <h2 className="text-white font-semibold text-sm mb-4">Textes du site</h2>
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Badge hero (ex. Depuis 2015)</label>
                  <input type="text" value={badge} onChange={(e) => setBadge(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Bouton CTA 1 (FR)</label>
                  <input type="text" value={cta1Fr} onChange={(e) => setCta1Fr(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Bouton CTA 2 — WhatsApp (FR)</label>
                  <input type="text" value={cta2Fr} onChange={(e) => setCta2Fr(e.target.value)} className={inputClass} />
                </div>
              </div>

              {/* Trust bar preview */}
              <div className="mt-4 rounded-xl bg-[#0D0D0D] border border-white/8 p-4">
                <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Barre de confiance</p>
                <div className="flex flex-wrap gap-2 text-xs text-white/60">
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[#C9A84C]" />
                    {badge}
                  </span>
                  <span className="text-white/20">·</span>
                  <span>Livraison Mondiale</span>
                  <span className="text-white/20">·</span>
                  <span>Service Après-Vente</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Produits vedettes ──────────────────────────────────────────── */}
          <div className="bg-white/5 border border-white/8 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-semibold text-sm">Produits vedettes (Best Sellers)</h2>
                <p className="text-white/40 text-xs mt-0.5">
                  {products.filter((p) => p.is_featured).length} produits en vedette actuellement
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {products.map((p) => (
                <label
                  key={p.id}
                  className={`cursor-pointer rounded-xl border p-3 flex flex-col gap-2 transition-all duration-150 ${
                    p.is_featured
                      ? 'border-[#C9A84C]/40 bg-[#C9A84C]/8'
                      : 'border-white/8 bg-white/3 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-8 h-8 relative rounded-lg overflow-hidden bg-white/8 flex-shrink-0">
                      {p.images[0] && (
                        <Image src={p.images[0]} alt={p.name_fr} fill className="object-cover" />
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={p.is_featured}
                      onChange={() => toggleFeatured(p.id)}
                      className="accent-[#C9A84C] w-3.5 h-3.5 mt-0.5"
                    />
                  </div>
                  <div>
                    <p className="text-white text-[10px] font-medium leading-tight line-clamp-2">{p.name_fr}</p>
                    <p className="text-[#C9A84C] text-[9px] font-mono mt-0.5">{p.product_code}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* ── Slogans carrousel ─────────────────────────────────────────── */}
          <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm">Slogans du carrousel</h2>
              <button
                onClick={addSlogan}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/8 text-white/60 text-xs rounded-xl hover:bg-white/15 hover:text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {slogans.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-3 bg-white/3 border border-white/8 rounded-xl group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/60 flex-shrink-0" />
                  {s.editing ? (
                    <>
                      <input
                        type="text"
                        value={s.draft}
                        autoFocus
                        onChange={(e) =>
                          setSlogans((prev) =>
                            prev.map((x) => (x.id === s.id ? { ...x, draft: e.target.value } : x))
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveSlogan(s.id);
                          if (e.key === 'Escape') setSlogans((prev) => prev.map((x) => (x.id === s.id ? { ...x, editing: false } : x)));
                        }}
                        className="flex-1 bg-transparent text-white text-sm outline-none border-b border-[#C9A84C]/50 pb-0.5"
                      />
                      <button onClick={() => saveSlogan(s.id)} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-white/70 text-sm italic">&ldquo;{s.text}&rdquo;</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditSlogan(s.id)}
                          className="w-6 h-6 rounded-lg bg-white/8 text-white/40 hover:text-[#C9A84C] hover:bg-[#C9A84C]/10 flex items-center justify-center transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteSlogan(s.id)}
                          className="w-6 h-6 rounded-lg bg-white/8 text-white/40 hover:text-red-400 hover:bg-red-400/10 flex items-center justify-center transition-colors"
                        >
                          <XIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
