/**
 * Persistent product storage via localStorage.
 * Falls back to static INITIAL_PRODUCTS if no data in storage.
 * Dispatches a CustomEvent so all open tabs sync in real time.
 */

import { PRODUCTS as INITIAL_PRODUCTS } from './products-data';
import type { Product } from '@/types';

export const PRODUCTS_STORAGE_KEY   = 'malkia_products';
export const PRODUCTS_CHANGED_EVENT = 'malkia:products-changed';

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

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch {
    // localStorage quota exceeded — store without base64 images
    const lite = products.map((p) => ({
      ...p,
      images: p.images.filter((img) => !img.startsWith('data:')),
    }));
    try { localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(lite)); } catch { /* ignore */ }
  }
  window.dispatchEvent(new CustomEvent(PRODUCTS_CHANGED_EVENT, { detail: products }));
}

export function getFeaturedProducts(): Product[] {
  return getProducts().filter((p) => p.is_featured && p.is_active);
}
