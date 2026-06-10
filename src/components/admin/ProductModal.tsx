'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Plus, Trash2, Package } from 'lucide-react';
import type { Product, Category, StockStatus } from '@/types';

interface ProductModalProps {
  product?: Product | null;
  onClose: () => void;
  onSave: (p: Product) => void;
}

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'body',      label: 'Corps (Body Care)'   },
  { value: 'face',      label: 'Visage (Face Care)'  },
  { value: 'fragrance', label: 'Parfums (Fragrances)'},
  { value: 'wellness',  label: 'Bien-être (Wellness)'},
];

const STOCK_OPTIONS: { value: StockStatus; label: string }[] = [
  { value: 'in_stock',     label: 'En stock'    },
  { value: 'low_stock',    label: 'Stock faible'},
  { value: 'out_of_stock', label: 'Épuisé'      },
];

const inputClass =
  'w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C9A84C]/50 transition-all placeholder:text-white/25';
const labelClass = 'block text-white/40 text-xs uppercase tracking-wider mb-1.5 font-medium';

export default function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const isNew = !product;

  const [nameFr, setNameFr]               = useState(product?.name_fr ?? '');
  const [nameEn, setNameEn]               = useState(product?.name_en ?? '');
  const [descFr, setDescFr]               = useState(product?.description_fr ?? '');
  const [descEn, setDescEn]               = useState(product?.description_en ?? '');
  const [category, setCategory]           = useState<Category>(product?.category ?? 'body');
  const [price, setPrice]                 = useState<number | ''>(product?.price_usd ?? '');
  const [stockStatus, setStockStatus]     = useState<StockStatus>(product?.stock_status ?? 'in_stock');
  const [isFeatured, setIsFeatured]       = useState(product?.is_featured ?? false);
  const [isActive, setIsActive]           = useState(product?.is_active ?? true);
  const [images, setImages]               = useState<string[]>(product?.images ?? []);
  const [newImageUrl, setNewImageUrl]     = useState('');
  const [showAddUrl, setShowAddUrl]       = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent scroll on body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setImages((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
      setShowAddUrl(false);
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    const saved: Product = {
      id:             product?.id ?? Date.now().toString(),
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
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

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
              <input
                type="text"
                value={nameFr}
                onChange={(e) => setNameFr(e.target.value)}
                placeholder="Nom du produit en français"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Name (English)</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Product name in English"
                className={inputClass}
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Description (Français)</label>
              <textarea
                value={descFr}
                onChange={(e) => setDescFr(e.target.value)}
                rows={3}
                placeholder="Description en français…"
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className={labelClass}>Description (English)</label>
              <textarea
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                rows={3}
                placeholder="Description in English…"
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* Category + Price + Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className={`${inputClass} cursor-pointer`}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value} className="bg-[#1a1a1a]">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Prix (USD)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0.00"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Stock</label>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value as StockStatus)}
                className={`${inputClass} cursor-pointer`}
              >
                {STOCK_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-[#1a1a1a]">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            {/* Is Featured */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  isFeatured ? 'bg-[#C9A84C]' : 'bg-white/15'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    isFeatured ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-white/60 text-sm">Produit vedette</span>
            </div>

            {/* Is Active */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  isActive ? 'bg-emerald-500' : 'bg-white/15'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-white/60 text-sm">Produit actif</span>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className={labelClass}>Images</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {images.length === 0 && (
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-white/20" />
                </div>
              )}
              {images.map((url, idx) => (
                <div key={idx} className="relative group w-10 h-10 rounded-lg overflow-hidden bg-white/8 flex-shrink-0">
                  <Image
                    src={url}
                    alt={`Image ${idx + 1}`}
                    fill
                    className="object-cover"
                    onError={() => {}}
                  />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute inset-0 bg-red-500/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}

              {!showAddUrl && (
                <button
                  onClick={() => setShowAddUrl(true)}
                  className="w-10 h-10 rounded-lg bg-white/5 border border-dashed border-white/20 hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/5 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4 text-white/40" />
                </button>
              )}
            </div>

            {showAddUrl && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addImageUrl(); if (e.key === 'Escape') setShowAddUrl(false); }}
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
                  onClick={() => { setShowAddUrl(false); setNewImageUrl(''); }}
                  className="px-3 py-2.5 bg-white/8 text-white/50 text-sm rounded-xl hover:bg-white/15 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-white/25 text-xs mt-1.5">Survolez une image pour la supprimer. Cliquez + pour ajouter une URL.</p>
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
            className="px-6 py-2.5 bg-[#C9A84C] text-black text-sm font-semibold rounded-xl hover:bg-[#C9A84C]/90 transition-colors"
          >
            {isNew ? 'Créer le produit' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}
