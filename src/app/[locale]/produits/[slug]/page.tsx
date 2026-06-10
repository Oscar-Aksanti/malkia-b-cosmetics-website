import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations, getLocale } from 'next-intl/server';
import { PRODUCTS, getProductBySlug, getRelatedProducts } from '@/lib/products-data';
import ProductDetail from '@/components/products/ProductDetail';
import type { Locale } from '@/types';

/* ── Static paths ─────────────────────────────────────────────────────────── */
export function generateStaticParams() {
  const locales = ['fr', 'en'];
  return locales.flatMap((locale) =>
    PRODUCTS.map((p) => ({ locale, slug: p.slug }))
  );
}

/* ── Metadata ─────────────────────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: 'Product not found' };

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
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product, 4);

  return <ProductDetail product={product} related={related} locale={locale as Locale} />;
}
