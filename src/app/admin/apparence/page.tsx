'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  Check, Info, Save, ImageIcon, Trash2, GripVertical,
  Monitor, Smartphone, ChevronLeft, ChevronRight, LayoutTemplate,
  Upload, X, Timer,
} from 'lucide-react';
import {
  getHeroSettings,
  saveHeroSettings,
  compressImage,
  INTERVAL_OPTIONS,
  type HeroSlide as HeroSlideType,
} from '@/lib/hero-settings';

interface ColorEntry {
  label: string;
  key: string;
  value: string;
}

interface Toggle {
  key: string;
  label: string;
  value: boolean;
}

// Re-export shared type locally for convenience
type HeroSlide = HeroSlideType;

const FONT_PREVIEWS = [
  {
    family: 'Cormorant Garamond',
    role: 'Titres',
    preview: 'Malkia B Cosmetics',
    style: { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '20px', fontWeight: 700 },
  },
  {
    family: 'Poppins',
    role: 'Corps',
    preview: 'True Beauty Comes From Within',
    style: { fontFamily: 'system-ui, sans-serif', fontSize: '14px', fontWeight: 400 },
  },
  {
    family: 'Dancing Script',
    role: 'Accents',
    preview: '"Feel Malkia"',
    style: { fontFamily: 'cursive', fontSize: '18px', fontStyle: 'italic', fontWeight: 600 },
  },
];

const RECOMMENDED_DIMS = {
  desktop: { w: 1920, h: 1080, ratio: '16:9', label: 'Desktop' },
  mobile:  { w: 768,  h: 1024, ratio: '3:4',  label: 'Mobile'  },
};

const INITIAL_SLIDES: HeroSlide[] = [
  { id: 'default', url: '/images/models/avatar-unlock-your-beauty.png', alt: 'Hero image principale' },
];

export default function AdminApparencePage() {
  /* ── Colors ──────────────────────────────────────────────────────── */
  const [colors, setColors] = useState<ColorEntry[]>([
    { label: 'Or principal',    key: 'gold',      value: '#C9A84C' },
    { label: 'Fuchsia accent',  key: 'fuchsia',   value: '#E91E8C' },
    { label: 'Fond clair',      key: 'cream',     value: '#FFF9F5' },
    { label: 'Fond sombre',     key: 'deep',      value: '#0D0D0D' },
    { label: 'WhatsApp vert',   key: 'whatsapp',  value: '#25D366' },
    { label: 'Texte principal', key: 'text',      value: '#1A1A1A' },
  ]);

  /* ── Toggles ─────────────────────────────────────────────────────── */
  const [toggles, setToggles] = useState<Toggle[]>([
    { key: 'whatsapp_btn',    label: 'Afficher le bouton WhatsApp flottant',   value: true  },
    { key: 'mobile_nav',      label: 'Afficher la barre de navigation mobile', value: true  },
    { key: 'animations',      label: 'Afficher les animations',                value: true  },
    { key: 'slogan_carousel', label: 'Afficher le carrousel slogans',           value: true  },
  ]);

  /* ── Hero images ─────────────────────────────────────────────────── */
  const [heroMode, setHeroMode]           = useState<'single' | 'carousel'>('single');
  const [slides, setSlides]               = useState<HeroSlide[]>(INITIAL_SLIDES);
  const [heroInterval, setHeroInterval]   = useState(5000);
  const [previewIdx, setPreviewIdx]       = useState(0);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [dragOver, setDragOver]           = useState(false);

  const fileInputRef    = useRef<HTMLInputElement>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  /* ── Load saved hero settings on mount ──────────────────────────── */
  useEffect(() => {
    const saved = getHeroSettings();
    setHeroMode(saved.mode);
    setSlides(saved.slides.length > 0 ? saved.slides : INITIAL_SLIDES);
    setHeroInterval(saved.interval);
  }, []);

  /* ── Save ────────────────────────────────────────────────────────── */
  const [saved, setSaved] = useState(false);

  const gold    = colors.find((c) => c.key === 'gold')?.value    ?? '#C9A84C';
  const fuchsia = colors.find((c) => c.key === 'fuchsia')?.value ?? '#E91E8C';
  const cream   = colors.find((c) => c.key === 'cream')?.value   ?? '#FFF9F5';
  const text    = colors.find((c) => c.key === 'text')?.value    ?? '#1A1A1A';

  const updateColor = (key: string, value: string) => {
    setColors((prev) => prev.map((c) => (c.key === key ? { ...c, value } : c)));
  };

  const toggleItem = (key: string) => {
    setToggles((prev) => prev.map((t) => (t.key === key ? { ...t, value: !t.value } : t)));
  };

  /* Accept one or more image files — compress then add as slides */
  const handleFiles = useCallback(async (files: FileList | null, replace = false) => {
    if (!files || files.length === 0) return;
    const accepted = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (accepted.length === 0) return;

    // Compress each image before storing (prevents localStorage quota errors)
    const newSlides: HeroSlide[] = await Promise.all(
      accepted.slice(0, 5).map(async (f) => ({
        id:  `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        url: await compressImage(f),
        alt: f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      }))
    );

    if (replace || heroMode === 'single') {
      setSlides(newSlides.slice(0, 1));
      setPreviewIdx(0);
    } else {
      setSlides((prev) => [...prev, ...newSlides].slice(0, 5)); // max 5
    }
  }, [heroMode]);

  const removeSlide = (id: string) => {
    setSlides((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (previewIdx >= next.length) setPreviewIdx(Math.max(0, next.length - 1));
      return next;
    });
  };

  const moveSlide = (id: string, dir: -1 | 1) => {
    setSlides((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  /* Drag & drop */
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true);  };
  const onDragLeave = ()                    => { setDragOver(false); };
  const onDrop      = (e: React.DragEvent, replace = false) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files, replace);
  };

  const handleSave = () => {
    // Persist hero settings → triggers live update on homepage
    saveHeroSettings({ mode: heroMode, slides, interval: heroInterval });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const currentSlide = slides[previewIdx];
  const dims = RECOMMENDED_DIMS[previewDevice];

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#0D0D0D]">
        <AdminSidebar />

        <main className="flex-1 min-w-0 p-4 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-white text-2xl md:text-3xl font-bold">Apparence</h1>
              <p className="text-white/40 text-sm mt-1">Couleurs, image hero et interface</p>
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

          {/* Demo notice */}
          <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-blue-300 text-xs leading-relaxed">
              Modifications en cours de développement — Supabase requis pour la persistance. Les changements s&apos;appliquent localement uniquement.
            </p>
          </div>

          {/* ══════════════════════════════════════════════════════════
              SECTION 1 — IMAGE HERO
          ══════════════════════════════════════════════════════════ */}
          <div className="bg-white/5 border border-white/8 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl bg-[#C9A84C]/20 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-[#C9A84C]" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-sm">Image Hero (Page d&apos;accueil)</h2>
                <p className="text-white/40 text-xs">L&apos;image principale en couverture du site</p>
              </div>
            </div>

            {/* Mode selector */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {(['single', 'carousel'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setHeroMode(mode)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    heroMode === mode
                      ? 'bg-[#C9A84C]/15 text-[#C9A84C] border-[#C9A84C]/30'
                      : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/70'
                  }`}
                >
                  <LayoutTemplate className="w-4 h-4" />
                  {mode === 'single' ? 'Image unique' : 'Carrousel d\'images'}
                </button>
              ))}
            </div>

            {/* Interval selector — only in carousel mode */}
            {heroMode === 'carousel' && (
              <div className="flex flex-wrap items-center gap-2 mb-5 p-3 bg-white/3 border border-white/8 rounded-xl">
                <Timer className="w-4 h-4 text-white/40 flex-shrink-0" />
                <span className="text-white/50 text-xs font-medium mr-1">Vitesse :</span>
                {INTERVAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setHeroInterval(opt.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                      heroInterval === opt.value
                        ? 'bg-[#C9A84C]/20 text-[#C9A84C] border-[#C9A84C]/30'
                        : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white/60'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}

                {/* Custom interval input */}
                <div className="flex items-center gap-1 ml-1">
                  <input
                    type="number"
                    min={2}
                    max={60}
                    value={Math.round(heroInterval / 1000)}
                    onChange={(e) => {
                      const s = Math.max(2, Math.min(60, parseInt(e.target.value) || 5));
                      setHeroInterval(s * 1000);
                    }}
                    className="w-14 px-2 py-1 bg-white/8 border border-white/15 rounded-lg text-white text-xs text-center focus:outline-none focus:border-[#C9A84C]/50 transition-all"
                  />
                  <span className="text-white/30 text-xs">sec</span>
                </div>
              </div>
            )}

            {/* Recommended dimensions info */}
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {Object.entries(RECOMMENDED_DIMS).map(([device, d]) => (
                <div key={device} className="flex items-center gap-3 p-3 bg-white/3 border border-white/8 rounded-xl">
                  {device === 'desktop'
                    ? <Monitor className="w-4 h-4 text-white/40 flex-shrink-0" />
                    : <Smartphone className="w-4 h-4 text-white/40 flex-shrink-0" />
                  }
                  <div>
                    <p className="text-white/70 text-xs font-medium">{d.label}</p>
                    <p className="text-white/35 text-[10px] font-mono">
                      {d.w} × {d.h} px &nbsp;·&nbsp; Ratio {d.ratio} &nbsp;·&nbsp; Format JPG/PNG/WebP
                    </p>
                  </div>
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] font-medium border border-[#C9A84C]/20">
                    Recommandé
                  </span>
                </div>
              ))}
            </div>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files, true)}
            />
            <input
              ref={addFileInputRef}
              type="file"
              accept="image/*"
              multiple={heroMode === 'carousel'}
              className="hidden"
              onChange={(e) => handleFiles(e.target.files, false)}
            />

            <div className="grid lg:grid-cols-2 gap-6">
              {/* ── Left: slide list + upload zone ─────────────────── */}
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider font-medium mb-3">
                  {heroMode === 'single' ? 'Image active' : `Images du carrousel (${slides.length})`}
                </p>

                {/* Slide list */}
                {slides.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {slides.map((slide, idx) => (
                      <div
                        key={slide.id}
                        onClick={() => setPreviewIdx(idx)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          previewIdx === idx
                            ? 'bg-[#C9A84C]/10 border-[#C9A84C]/30'
                            : 'bg-white/3 border-white/8 hover:bg-white/5'
                        }`}
                      >
                        {heroMode === 'carousel' && (
                          <GripVertical className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
                        )}

                        {/* Thumbnail */}
                        <div className="w-12 h-8 relative rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                          {slide.url ? (
                            <Image
                              src={slide.url}
                              alt={slide.alt}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-3 h-3 text-white/20" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">{slide.alt}</p>
                          <p className="text-white/30 text-[10px]">
                            {slide.url.startsWith('data:') ? 'Fichier local' : slide.url}
                          </p>
                        </div>

                        {previewIdx === idx && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] font-medium border border-[#C9A84C]/30 flex-shrink-0">
                            Actif
                          </span>
                        )}

                        {/* Controls */}
                        <div className="flex items-center gap-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          {heroMode === 'carousel' && (
                            <>
                              <button
                                onClick={() => moveSlide(slide.id, -1)}
                                disabled={idx === 0}
                                className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white/70 disabled:opacity-20 transition-colors"
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => moveSlide(slide.id, 1)}
                                disabled={idx === slides.length - 1}
                                className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-white/70 disabled:opacity-20 transition-colors"
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => removeSlide(slide.id)}
                            disabled={slides.length === 1}
                            className="w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-red-400 disabled:opacity-20 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Drop zone ──────────────────────────────────── */}
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, heroMode === 'single')}
                  className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${
                    dragOver
                      ? 'border-[#C9A84C] bg-[#C9A84C]/8'
                      : 'border-white/15 bg-white/3 hover:border-white/25 hover:bg-white/5'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-3 py-8 px-4 text-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      dragOver ? 'bg-[#C9A84C]/20' : 'bg-white/5'
                    }`}>
                      <Upload className={`w-5 h-5 transition-colors ${dragOver ? 'text-[#C9A84C]' : 'text-white/30'}`} />
                    </div>

                    <div>
                      <p className="text-white/60 text-sm font-medium">
                        {dragOver
                          ? 'Relâchez pour charger...'
                          : heroMode === 'single'
                            ? slides.length > 0 ? 'Déposer pour remplacer' : 'Déposer une image'
                            : 'Déposer des images'
                        }
                      </p>
                      <p className="text-white/25 text-xs mt-0.5">
                        JPG, PNG, WebP — {heroMode === 'carousel' ? 'plusieurs fichiers acceptés' : 'un seul fichier'}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {/* Primary: replace / add from disk */}
                      <button
                        onClick={() => {
                          if (heroMode === 'single') {
                            fileInputRef.current?.click();
                          } else {
                            addFileInputRef.current?.click();
                          }
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#C9A84C] text-black text-xs font-semibold rounded-xl hover:bg-[#C9A84C]/90 transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        {heroMode === 'single' && slides.length > 0 ? 'Remplacer l\'image' : 'Choisir un fichier'}
                      </button>

                      {/* Cancel — clear current (only when has image) */}
                      {slides.length > 0 && heroMode === 'single' && (
                        <button
                          onClick={() => { setSlides(INITIAL_SLIDES); setPreviewIdx(0); }}
                          className="w-8 h-8 rounded-xl bg-white/8 text-white/30 flex items-center justify-center hover:bg-red-500/15 hover:text-red-400 transition-all"
                          title="Réinitialiser"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* File info hint */}
                <p className="text-white/20 text-[10px] mt-2 text-center">
                  L&apos;image est chargée localement — connectez Supabase Storage pour la persistance
                </p>
              </div>

              {/* ── Right: preview ─────────────────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/50 text-xs uppercase tracking-wider font-medium">Aperçu</p>
                  <div className="flex gap-1">
                    {(['desktop', 'mobile'] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setPreviewDevice(d)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                          previewDevice === d
                            ? 'bg-[#C9A84C]/20 text-[#C9A84C]'
                            : 'text-white/30 hover:text-white/60'
                        }`}
                      >
                        {d === 'desktop' ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview frame */}
                <div
                  className={`relative rounded-xl overflow-hidden bg-black border border-white/10 mx-auto ${
                    previewDevice === 'mobile' ? 'max-w-[220px]' : 'w-full'
                  }`}
                  style={{ aspectRatio: previewDevice === 'mobile' ? '3/4' : '16/9' }}
                >
                  {currentSlide?.url ? (
                    <Image
                      src={currentSlide.url}
                      alt={currentSlide.alt}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-white/15" />
                    </div>
                  )}

                  {/* Overlay simulation */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Simulated hero text */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-xs font-medium mb-1 truncate" style={{ color: gold }}>Since 2015</p>
                    <p className="text-white text-sm font-bold leading-tight truncate">Votre Beauté,</p>
                    <p className="text-sm font-bold leading-tight mb-2 truncate" style={{ color: fuchsia }}>Notre Priorité</p>
                    <div className="flex gap-1.5">
                      <span className="text-[9px] px-2 py-1 rounded-full text-black font-semibold" style={{ background: gold }}>
                        Découvrir
                      </span>
                      <span className="text-[9px] px-2 py-1 rounded-full text-white font-semibold" style={{ background: '#25D366' }}>
                        WhatsApp
                      </span>
                    </div>
                  </div>

                  {/* Carousel dots */}
                  {heroMode === 'carousel' && slides.length > 1 && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                      {slides.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPreviewIdx(i)}
                          className={`rounded-full transition-all ${
                            i === previewIdx ? 'w-4 h-1.5' : 'w-1.5 h-1.5'
                          }`}
                          style={{ background: i === previewIdx ? gold : 'rgba(255,255,255,0.4)' }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Carousel arrows */}
                  {heroMode === 'carousel' && slides.length > 1 && (
                    <>
                      <button
                        onClick={() => setPreviewIdx((i) => (i - 1 + slides.length) % slides.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-white/80 hover:bg-black/60 transition-colors"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setPreviewIdx((i) => (i + 1) % slides.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-white/80 hover:bg-black/60 transition-colors"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>

                {/* Dimension reminder */}
                <div className="mt-3 p-3 bg-white/3 border border-white/8 rounded-xl">
                  <div className="flex items-center gap-2">
                    {previewDevice === 'desktop'
                      ? <Monitor className="w-3.5 h-3.5 text-white/30" />
                      : <Smartphone className="w-3.5 h-3.5 text-white/30" />
                    }
                    <span className="text-white/40 text-[10px] uppercase tracking-wider font-medium">
                      Format recommandé — {dims.label}
                    </span>
                  </div>
                  <p className="text-white/60 text-xs font-mono mt-1">
                    {dims.w} × {dims.h} px &nbsp;·&nbsp; Ratio {dims.ratio}
                  </p>
                  <p className="text-white/30 text-[10px] mt-0.5">
                    JPG ou WebP pour de meilleures performances. PNG si transparence requise.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              SECTION 2 — COULEURS + APERÇU
          ══════════════════════════════════════════════════════════ */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Couleurs du thème */}
            <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
              <h2 className="text-white font-semibold text-sm mb-4">Couleurs du thème</h2>
              <div className="space-y-3">
                {colors.map((c) => (
                  <div key={c.key} className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-9 h-9 rounded-xl border border-white/20 cursor-pointer overflow-hidden shadow-sm"
                        style={{ background: c.value }}
                      />
                      <input
                        type="color"
                        value={c.value}
                        onChange={(e) => updateColor(c.key, e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        title={`Choisir ${c.label}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-xs font-medium">{c.label}</p>
                      <p className="text-white/30 text-[10px] font-mono">{c.value}</p>
                    </div>
                    <input
                      type="text"
                      value={c.value}
                      onChange={(e) => updateColor(c.key, e.target.value)}
                      maxLength={7}
                      className="w-24 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-[#C9A84C]/50 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Aperçu thème */}
            <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
              <h2 className="text-white font-semibold text-sm mb-4">Aperçu thème</h2>
              <div
                className="rounded-2xl overflow-hidden border shadow-xl"
                style={{ background: cream, borderColor: `${gold}30` }}
              >
                <div className="h-36 flex items-center justify-center" style={{ background: `${gold}15` }}>
                  <div className="text-center">
                    <div
                      className="w-14 h-14 rounded-2xl mx-auto mb-2 flex items-center justify-center"
                      style={{ background: `${fuchsia}20` }}
                    >
                      <span className="text-2xl">✨</span>
                    </div>
                    <p className="text-xs font-mono" style={{ color: gold }}>MKB-0010</p>
                  </div>
                </div>
                <div className="p-4">
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: `${fuchsia}15`, color: fuchsia }}
                  >
                    Visage
                  </span>
                  <p className="font-semibold mt-2 text-sm leading-tight" style={{ color: text }}>
                    Biovène Éclat Suprême
                  </p>
                  <p className="text-xs mt-1" style={{ color: `${text}99` }}>
                    L&apos;apogée du luxe en soin de la peau
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold" style={{ color: gold }}>$35</span>
                    <button
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
                      style={{ background: fuchsia }}
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-white/25 text-[10px] mt-3 text-center">
                Cliquez sur une couleur ci-dessus pour voir les changements en temps réel
              </p>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              SECTION 3 — TYPO + INTERFACE
          ══════════════════════════════════════════════════════════ */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Typographie */}
            <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
              <h2 className="text-white font-semibold text-sm mb-4">Typographie</h2>
              <div className="space-y-3">
                {FONT_PREVIEWS.map((f) => (
                  <div key={f.family} className="p-4 bg-white/3 border border-white/8 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium">{f.role}</p>
                      <span className="text-white/20 text-[9px] font-mono">{f.family}</span>
                    </div>
                    <p className="text-white" style={f.style}>{f.preview}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Éléments d'interface */}
            <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
              <h2 className="text-white font-semibold text-sm mb-4">Éléments d&apos;interface</h2>
              <div className="space-y-3">
                {toggles.map((t) => (
                  <div key={t.key} className="flex items-center justify-between p-3 bg-white/3 border border-white/8 rounded-xl">
                    <span className="text-white/70 text-sm">{t.label}</span>
                    <button
                      type="button"
                      onClick={() => toggleItem(t.key)}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                        t.value ? 'bg-[#C9A84C]' : 'bg-white/15'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          t.value ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {toggles.find((t) => t.key === 'whatsapp_btn')?.value && (
                <div className="mt-4 p-4 bg-white/3 border border-white/8 rounded-xl">
                  <p className="text-white/30 text-[10px] uppercase tracking-wider mb-3">Aperçu bouton WhatsApp</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                      style={{ background: '#25D366' }}
                    >
                      <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-xs font-medium">Bouton WhatsApp flottant</p>
                      <p className="text-white/40 text-[10px]">Toujours visible, coin bas-droit</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
