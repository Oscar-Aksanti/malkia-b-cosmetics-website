'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { X, Trash2, Package, Upload, Link, ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import type { Product, Category, StockStatus } from '@/types';

interface ProductModalProps {
  product?: Product | null;
  onClose: () => void;
  onSave: (p: Product) => void;
}

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'body',      label: 'Corps (Body Care)'    },
  { value: 'face',      label: 'Visage (Face Care)'   },
  { value: 'fragrance', label: 'Parfums (Fragrances)' },
  { value: 'wellness',  label: 'Bien-être (Wellness)' },
];

const STOCK_OPTIONS: { value: StockStatus; label: string }[] = [
  { value: 'in_stock',     label: 'En stock'     },
  { value: 'low_stock',    label: 'Stock faible' },
  { value: 'out_of_stock', label: 'Épuisé'       },
];

const inputClass =
  'w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C9A84C]/50 transition-all placeholder:text-white/25';
const labelClass = 'block text-white/40 text-xs uppercase tracking-wider mb-1.5 font-medium';

export default function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const isNew = !product;

  const [nameFr, setNameFr]           = useState(product?.name_fr ?? '');
  const [nameEn, setNameEn]           = useState(product?.name_en ?? '');
  const [descFr, setDescFr]           = useState(product?.description_fr ?? '');
  const [descEn, setDescEn]           = useState(product?.description_en ?? '');
  const [category, setCategory]       = useState<Category>(product?.category ?? 'body');
  const [price, setPrice]             = useState<number | ''>(product?.price_usd ?? '');
  const [stockStatus, setStockStatus] = useState<StockStatus>(product?.stock_status ?? 'in_stock');
  const [isFeatured, setIsFeatured]   = useState(product?.is_featured ?? false);
  const [isActive, setIsActive]       = useState(product?.is_active ?? true);
  const [images, setImages]           = useState<string[]>(product?.images ?? []);

  // Image add mode: 'none' | 'upload' | 'url'
  const [addMode, setAddMode]     = useState<'none' | 'upload' | 'url'>('none');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!arr.length) return;
    setUploading(true);
    setUploadError(null);
    const hash = process.env.NEXT_PUBLIC_ADMIN_HASH ?? '';
    try {
      const urls = await Promise.all(
        arr.map(async (f) => {
          const form = new FormData();
          form.append('file', f);
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${hash}` },
            body: form,
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error ?? `Upload failed (${res.status})`);
          }
          const { url } = await res.json();
          return url as string;
        })
      );
      setImages((prev) => [...prev, ...urls].slice(0, 6));
      setAddMode('none');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload échoué');
    } finally {
      setUploading(false);
    }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setImages((prev) => [...prev, newImageUrl.trim()].slice(0, 6));
      setNewImageUrl('');
      setAddMode('none');
    }
  };

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    const now = new Date().toISOString();
    const saved: Product = {
      id:             product?.id ?? crypto.randomUUID(),
      product_code:   product?.product_code ?? `MKB-NEW-${Date.now()}`,
      slug:           product?.slug ?? nameFr.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      name_fr:        nameFr,
      name_en:        nameEn,
      description_fr: descFr,
      description_en: descEn,
      category,
      price_usd:      typeof price === 'number' ? price : 0,
      images,
      stock_status:   stockStatus,
      is_active:      isActive,
      is_featured:    isFeatured,
      created_at:     product?.created_at ?? now,
    };
    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full md:max-w-3xl md:mx-4 bg-[#111111] md:rounded-2xl border border-white/10 flex flex-col max-h-screen md:max-h-[90vh] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 flex-shrink-0">
          <div>
            <h2 className="text-white font-semibold text-lg">
              {isNew ? 'Nouveau produit' : nameFr || product?.name_fr}
            </h2>
            {!isNew && (
              <p className="text-[#C9A84C] text-xs font-mono mt-0.5">{product?.product_code}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/8 text-white/50 hover:text-white hover:bg-white/15 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nom (Français)</label>
              <input type="text" value={nameFr} onChange={(e) => setNameFr(e.target.value)}
                placeholder="Nom du produit en français" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Name (English)</label>
              <input type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)}
                placeholder="Product name in English" className={inputClass} />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Description (Français)</label>
              <textarea value={descFr} onChange={(e) => setDescFr(e.target.value)} rows={3}
                placeholder="Description en français…" className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label className={labelClass}>Description (English)</label>
              <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={3}
                placeholder="Description in English…" className={`${inputClass} resize-none`} />
            </div>
          </div>

          {/* Category + Price + Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Catégorie</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as Category)}
                className={`${inputClass} cursor-pointer`}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value} className="bg-[#1a1a1a]">{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Prix (USD)</label>
              <input type="number" min={0} step={0.01} value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0.00" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Stock</label>
              <select value={stockStatus} onChange={(e) => setStockStatus(e.target.value as StockStatus)}
                className={`${inputClass} cursor-pointer`}>
                {STOCK_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-[#1a1a1a]">{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setIsFeatured(!isFeatured)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${isFeatured ? 'bg-[#C9A84C]' : 'bg-white/15'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${isFeatured ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <span className="text-white/60 text-sm">Produit vedette</span>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setIsActive(!isActive)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${isActive ? 'bg-emerald-500' : 'bg-white/15'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <span className="text-white/60 text-sm">Produit actif</span>
            </div>
          </div>

          {/* ── Images ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={labelClass + ' mb-0'}>
                Images du produit
                <span className="text-white/20 normal-case tracking-normal font-normal ml-1">
                  ({images.length}/6)
                </span>
              </label>
              {images.length < 6 && addMode === 'none' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setAddMode('upload')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] text-xs font-medium hover:bg-[#C9A84C]/20 transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    Depuis l&apos;ordinateur
                  </button>
                  <button
                    onClick={() => setAddMode('url')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-white/50 text-xs font-medium hover:bg-white/10 transition-colors"
                  >
                    <Link className="w-3 h-3" />
                    URL
                  </button>
                </div>
              )}
            </div>

            {/* Image previews */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {images.map((url, idx) => (
                  <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden bg-white/8 flex-shrink-0 border border-white/10">
                    <Image
                      src={url}
                      alt={`Image ${idx + 1}`}
                      fill
                      unoptimized={url.startsWith('data:')}
                      className="object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-[#C9A84C] text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        1ère
                      </span>
                    )}
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {images.length === 0 && addMode === 'none' && (
              <div className="flex items-center gap-3 p-4 bg-white/3 border border-dashed border-white/15 rounded-xl mb-3">
                <ImageIcon className="w-8 h-8 text-white/15 flex-shrink-0" />
                <div>
                  <p className="text-white/40 text-sm">Aucune image ajoutée</p>
                  <p className="text-white/20 text-xs mt-0.5">Utilisez les boutons ci-dessus pour ajouter une image</p>
                </div>
              </div>
            )}

            {/* Upload zone */}
            {addMode === 'upload' && (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#C9A84C] bg-[#C9A84C]/10'
                    : 'border-white/20 bg-white/3 hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/5'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onFileChange}
                  className="hidden"
                />
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 text-[#C9A84C] animate-spin" />
                    <p className="text-white/50 text-sm">Upload en cours…</p>
                  </div>
                ) : uploadError ? (
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                    <p className="text-red-400 text-sm">{uploadError}</p>
                    <p className="text-white/30 text-xs">Vérifiez que le bucket &quot;product-images&quot; existe dans Supabase Storage</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-white/30 mx-auto mb-2" />
                    <p className="text-white/60 text-sm font-medium">
                      Glissez vos images ici ou <span className="text-[#C9A84C]">cliquez pour parcourir</span>
                    </p>
                    <p className="text-white/25 text-xs mt-1">JPG, PNG, WEBP — max 6 images</p>
                  </>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setAddMode('none'); }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/10 text-white/40 hover:text-white flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* URL input */}
            {addMode === 'url' && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addImageUrl();
                    if (e.key === 'Escape') { setAddMode('none'); setNewImageUrl(''); }
                  }}
                  placeholder="https://... ou /images/products/..."
                  className={`${inputClass} flex-1`}
                  autoFocus
                />
                <button
                  onClick={addImageUrl}
                  className="px-4 py-2.5 bg-[#C9A84C] text-black text-sm font-semibold rounded-xl hover:bg-[#C9A84C]/90 transition-colors"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => { setAddMode('none'); setNewImageUrl(''); }}
                  className="px-3 py-2.5 bg-white/8 text-white/50 text-sm rounded-xl hover:bg-white/15 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {images.length > 0 && (
              <p className="text-white/20 text-xs mt-2">
                Survolez une image pour la supprimer. La 1ère image est utilisée comme miniature.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/8 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white/8 text-white/60 text-sm font-medium rounded-xl hover:bg-white/15 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!nameFr.trim()}
            className="px-6 py-2.5 bg-[#C9A84C] text-black text-sm font-semibold rounded-xl hover:bg-[#C9A84C]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isNew ? 'Créer le produit' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}
