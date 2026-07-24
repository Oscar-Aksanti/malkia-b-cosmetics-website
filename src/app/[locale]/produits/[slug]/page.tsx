import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSupabaseClient } from '@/lib/supabase';
import { PRODUCTS, getProductBySlug, getRelatedProducts } from '@/lib/products-data';
import ProductDetail from '@/components/products/ProductDetail';
import type { Locale, Product } from '@/types';

/* Allow dynamic params so admin-added products get their own pages */
export const dynamicParams = true;

/* Always fetch fresh from Supabase — never use stale cached HTML */
export const dynamic = 'force-dynamic';

/* ── Fetch helpers ────────────────────────────────────────────────────────── */
async function getProductFromDB(slug: string): Promise<Product | null> {
  try {
    const db = getSupabaseClient();
    const { data, error } = await db
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    if (error || !data) return null;
    return data as Product;
  } catch {
    return null;
  }
}

async function getRelatedFromDB(product: Product, limit = 4): Promise<Product[]> {
  try {
    const db = getSupabaseClient();
    const { data } = await db
      .from('products')
      .select('*')
      .eq('category', product.category)
      .eq('is_active', true)
      .neq('id', product.id)
      .limit(limit);
    return (data ?? []) as Product[];
  } catch {
    return [];
  }
}

/* ── Static paths (seed data only — dynamic routes handled above) ─────────── */
export function generateStaticParams() {
  // Return empty — force-dynamic handles all routes at request time
  return [];
}

/* ── Metadata ─────────────────────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  // Try DB first, then static fallback
  const product = (await getProductFromDB(slug)) ?? getProductBySlug(slug);
  if (!product) return { title: 'Produit introuvable' };

  const name = locale === 'fr' ? product.name_fr : product.name_en;
  const desc = locale === 'fr' ? product.description_fr : product.description_en;

  return {
    title: name,
    description: desc || `${name} — Malkia B Cosmetics`,
    openGraph: {
      title: `${name} | Malkia B Cosmetics`,
      description: desc || '',
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  // Try Supabase first (live prices + descriptions), then static fallback
  const product = (await getProductFromDB(slug)) ?? getProductBySlug(slug);
  if (!product) notFound();

  // Fetch related products (DB preferred, static fallback)
  const relatedFromDB = await getRelatedFromDB(product);
  const related =
    relatedFromDB.length > 0 ? relatedFromDB : getRelatedProducts(product, 4);

  return <ProductDetail product={product} related={related} locale={locale as Locale} />;
}
