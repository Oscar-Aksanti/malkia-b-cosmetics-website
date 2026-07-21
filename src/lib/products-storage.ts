/**
 * Product storage — localStorage as fast cache, Supabase as source of truth.
 *
 * Read order:  localStorage (instant) → then Supabase via syncProductsFromDB()
 * Write order: localStorage (instant) → then Supabase via pushProductsToDB()
 */

import { PRODUCTS as INITIAL_PRODUCTS } from './products-data';
import type { Product } from '@/types';

export const PRODUCTS_STORAGE_KEY   = 'malkia_products';
export const PRODUCTS_CHANGED_EVENT = 'malkia:products-changed';

/* ── Synchronous cache helpers ────────────────────────────────────────────── */

export function getProducts(): Product[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) return INITIAL_PRODUCTS;
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function getFeaturedProducts(): Product[] {
  return getProducts().filter((p) => p.is_featured && p.is_active);
}

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch {
    // quota exceeded — store without base64 images
    const lite = products.map((p) => ({
      ...p,
      images: p.images.filter((img) => !img.startsWith('data:')),
    }));
    try { localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(lite)); } catch { /* ignore */ }
  }
  window.dispatchEvent(new CustomEvent(PRODUCTS_CHANGED_EVENT, { detail: products }));
}

/* ── Supabase sync (async) ────────────────────────────────────────────────── */

/**
 * Fetch products from Supabase, update the localStorage cache,
 * and broadcast the change event. Falls back to cache silently.
 */
export async function syncProductsFromDB(): Promise<Product[]> {
  try {
    const res = await fetch('/api/products', { cache: 'no-store' });
    if (!res.ok) return getProducts();
    const fresh: Product[] = await res.json();
    if (Array.isArray(fresh) && fresh.length > 0) {
      saveProducts(fresh);
      return fresh;
    }
    return getProducts();
  } catch {
    return getProducts();
  }
}

/**
 * Push the products array to Supabase. Called after every admin save/delete.
 * Never throws — fails silently so the UI stays responsive.
 */
export async function pushProductsToDB(products: Product[]): Promise<void> {
  const hash = process.env.NEXT_PUBLIC_ADMIN_HASH ?? '';
  // Strip base64 images before sending — they can exceed Vercel's 4.5MB body limit
  const lean = products.map((p) => ({
    ...p,
    images: p.images.filter((img) => !img.startsWith('data:')),
  }));
  try {
    await fetch('/api/products', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hash}`,
      },
      body: JSON.stringify(lean),
    });
  } catch (err) {
    console.warn('[pushProductsToDB] failed:', err);
  }
}
