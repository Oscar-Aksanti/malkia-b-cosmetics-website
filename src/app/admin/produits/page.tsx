'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ProductModal from '@/components/admin/ProductModal';
import { getProducts, saveProducts, syncProductsFromDB, pushProductsToDB, PRODUCTS_CHANGED_EVENT } from '@/lib/products-storage';
import type { Product, StockStatus } from '@/types';
import {
  Search,
  Star,
  Package,
  AlertTriangle,
  XCircle,
  ChevronDown,
  Check,
  Edit2,
  Trash2,
  Plus,
  CloudUpload,
  Loader2,
} from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  body: 'Corps', face: 'Visage', fragrance: 'Parfums', wellness: 'Bien-être',
};

const STOCK_CONFIG: Record<StockStatus, { label: string; icon: React.ElementType; cls: string }> = {
  in_stock:     { label: 'En stock',     icon: Check,         cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  low_stock:    { label: 'Stock faible', icon: AlertTriangle, cls: 'text-amber-400 bg-amber-400/10 border-amber-400/30'       },
  out_of_stock: { label: 'Épuisé',       icon: XCircle,       cls: 'text-red-400 bg-red-400/10 border-red-400/30'             },
};

export default function AdminProduitsPage() {
  const [products, setProducts]         = useState<Product[]>([]);
  const [search, setSearch]             = useState('');
  const [filterCat, setFilterCat]       = useState<string>('all');
  const [filterStock, setFilterStock]   = useState<string>('all');
  const [modalOpen, setModalOpen]       = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [syncing, setSyncing]           = useState(false);
  const [syncMsg, setSyncMsg]           = useState<{ ok: boolean; text: string } | null>(null);

  // Load from localStorage on mount, then fetch fresh data from Supabase
  useEffect(() => {
    setProducts(getProducts());
    syncProductsFromDB().then((fresh) => { if (fresh.length > 0) setProducts(fresh); });

    const onChanged = (e: Event) => {
      const detail = (e as CustomEvent<Product[]>).detail;
      if (detail) setProducts(detail);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'malkia_products') setProducts(getProducts());
    };
    window.addEventListener(PRODUCTS_CHANGED_EVENT, onChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(PRODUCTS_CHANGED_EVENT, onChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.name_fr.toLowerCase().includes(q) || p.product_code.toLowerCase().includes(q)
      );
    }
    if (filterCat !== 'all') list = list.filter((p) => p.category === filterCat);
    if (filterStock !== 'all') list = list.filter((p) => p.stock_status === filterStock);
    return list;
  }, [products, search, filterCat, filterStock]);

  const stats = {
    total:    products.length,
    inStock:  products.filter((p) => p.stock_status === 'in_stock').length,
    lowStock: products.filter((p) => p.stock_status === 'low_stock').length,
    outStock: products.filter((p) => p.stock_status === 'out_of_stock').length,
  };

  const syncToSupabase = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const hash = process.env.NEXT_PUBLIC_ADMIN_HASH ?? '';
      // Strip base64 images before sending to avoid Vercel's 4.5MB body limit
      const lean = products.map((p) => ({
        ...p,
        images: p.images.filter((img) => !img.startsWith('data:')),
      }));
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hash}`,
        },
        body: JSON.stringify(lean),
      });
      if (res.ok) {
        setSyncMsg({ ok: true, text: `✓ ${products.length} produits synchronisés — tous les appareils verront les mêmes prix` });
      } else {
        const err = await res.json().catch(() => ({}));
        setSyncMsg({ ok: false, text: `Erreur ${res.status} : ${err.error ?? err.message ?? JSON.stringify(err)}` });
      }
    } catch (e) {
      setSyncMsg({ ok: false, text: 'Impossible de joindre l\'API — vérifiez la connexion' });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(null), 8000);
    }
  };

  const openAdd = () => {
    setModalProduct(null);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setModalProduct(p);
    setModalOpen(true);
  };

  const handleSave = (saved: Product) => {
    setProducts((prev) => {
      const exists = prev.find((p) => p.id === saved.id);
      const updated = exists
        ? prev.map((p) => (p.id === saved.id ? saved : p))
        : [saved, ...prev];
      saveProducts(updated);
      pushProductsToDB(updated); // persist to Supabase
      return updated;
    });
    setModalOpen(false);
    setModalProduct(null);
  };

  const confirmDelete = (id: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveProducts(updated);
      pushProductsToDB(updated); // persist to Supabase
      return updated;
    });
    setDeletingId(null);
  };

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#0D0D0D]">
        <AdminSidebar />

        <main className="flex-1 min-w-0 p-4 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-white text-2xl md:text-3xl font-bold">Produits</h1>
              <p className="text-white/40 text-sm mt-1">{products.length} produits dans le catalogue</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={syncToSupabase}
                disabled={syncing || products.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                title="Synchroniser tous les produits vers Supabase (rend les prix visibles sur tous les appareils)"
              >
                {syncing
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <CloudUpload className="w-4 h-4" />}
                <span className="hidden sm:inline">{syncing ? 'Sync...' : 'Sync Supabase'}</span>
              </button>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#C9A84C] text-black text-sm font-semibold rounded-xl hover:bg-[#C9A84C]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Ajouter un produit</span>
                <span className="sm:hidden">Ajouter</span>
              </button>
            </div>
          </div>

          {/* Sync feedback */}
          {syncMsg && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium border ${
              syncMsg.ok
                ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400'
                : 'bg-red-400/10 border-red-400/30 text-red-400'
            }`}>
              {syncMsg.text}
            </div>
          )}

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total',        value: stats.total,    color: '#C9A84C', icon: Package        },
              { label: 'En stock',     value: stats.inStock,  color: '#10B981', icon: Check          },
              { label: 'Stock faible', value: stats.lowStock, color: '#F59E0B', icon: AlertTriangle  },
              { label: 'Épuisé',       value: stats.outStock, color: '#EF4444', icon: XCircle        },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="bg-white/5 border border-white/8 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                  <span className="text-white/50 text-[10px] font-medium uppercase tracking-wider">{label}</span>
                </div>
                <p className="text-white text-xl font-bold">{value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un produit ou référence…"
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#C9A84C]/50 transition-all"
              />
            </div>
            <div className="relative">
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C9A84C]/50 cursor-pointer"
              >
                <option value="all">Toutes catégories</option>
                <option value="body">Corps</option>
                <option value="face">Visage</option>
                <option value="fragrance">Parfums</option>
                <option value="wellness">Bien-être</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C9A84C]/50 cursor-pointer"
              >
                <option value="all">Tous les stocks</option>
                <option value="in_stock">En stock</option>
                <option value="low_stock">Stock faible</option>
                <option value="out_of_stock">Épuisé</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
            </div>
          </div>

          {/* Products table */}
          <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="px-4 py-3 text-left text-white/40 text-xs font-medium uppercase tracking-wider">Produit</th>
                    <th className="px-4 py-3 text-left text-white/40 text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Catégorie</th>
                    <th className="px-4 py-3 text-left text-white/40 text-xs font-medium uppercase tracking-wider">Prix</th>
                    <th className="px-4 py-3 text-left text-white/40 text-xs font-medium uppercase tracking-wider">Stock</th>
                    <th className="px-4 py-3 text-left text-white/40 text-xs font-medium uppercase tracking-wider hidden md:table-cell">Vedette</th>
                    <th className="px-4 py-3 text-right text-white/40 text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => {
                    const stockCfg = STOCK_CONFIG[product.stock_status];
                    const StockIcon = stockCfg.icon;
                    const isDeleting = deletingId === product.id;

                    return (
                      <tr
                        key={product.id}
                        className={`border-b border-white/5 last:border-0 transition-colors ${
                          isDeleting ? 'bg-red-500/5' : 'hover:bg-white/3'
                        }`}
                      >
                        {/* Product */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-white/8 flex-shrink-0">
                              {product.images[0] ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name_fr}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-4 h-4 text-white/20" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white text-xs font-medium truncate max-w-[120px] md:max-w-[200px]">
                                {product.name_fr}
                              </p>
                              <p className="text-[#C9A84C] text-[10px] font-mono">{product.product_code}</p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-white/50 text-xs">{CATEGORY_LABELS[product.category]}</span>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3">
                          <span className="text-white font-semibold text-xs">${product.price_usd}</span>
                        </td>

                        {/* Stock badge */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${stockCfg.cls}`}>
                            <StockIcon className="w-2.5 h-2.5" />
                            <span className="hidden sm:inline">{stockCfg.label}</span>
                          </span>
                        </td>

                        {/* Featured star */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <Star
                            className={`w-4 h-4 ${product.is_featured ? 'text-[#C9A84C]' : 'text-white/15'}`}
                            fill={product.is_featured ? 'currentColor' : 'none'}
                          />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          {isDeleting ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-red-400 text-xs font-medium hidden sm:inline">Supprimer&nbsp;?</span>
                              <button
                                onClick={() => confirmDelete(product.id)}
                                className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors"
                              >
                                Oui
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="px-2.5 py-1 rounded-lg bg-white/8 text-white/50 text-xs font-medium hover:bg-white/15 transition-colors"
                              >
                                Non
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEdit(product)}
                                className="w-7 h-7 rounded-lg bg-white/8 text-white/40 flex items-center justify-center hover:bg-[#C9A84C]/20 hover:text-[#C9A84C] transition-all"
                                title="Modifier"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingId(product.id)}
                                className="w-7 h-7 rounded-lg bg-white/8 text-white/40 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <Package className="w-8 h-8 text-white/15 mx-auto mb-3" />
                <p className="text-white/30 text-sm">Aucun produit trouvé</p>
              </div>
            )}
          </div>

          <p className="text-white/20 text-xs mt-3 text-right">
            {filtered.length} produit{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''}
          </p>
        </main>
      </div>

      {/* Product modal */}
      {modalOpen && (
        <ProductModal
          product={modalProduct}
          onClose={() => { setModalOpen(false); setModalProduct(null); }}
          onSave={handleSave}
        />
      )}
    </AdminGuard>
  );
}
