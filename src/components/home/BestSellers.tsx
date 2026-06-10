import { getTranslations } from 'next-intl/server';
import { FEATURED_PRODUCTS } from '@/lib/products-data';
import ProductCard from '@/components/products/ProductCard';
import SectionTitle from '@/components/ui/SectionTitle';
import { Link } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';

export default async function BestSellers() {
  const t      = await getTranslations('sections');
  const tNav   = await getTranslations('products');
  const locale = await getLocale();

  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          accent="✨ Best-Sellers"
          title={t('bestSellers')}
          subtitle={t('bestSellersSubtitle')}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {FEATURED_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-10 md:mt-14 text-center">
          <Link
            href="/produits"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gold text-gold hover:bg-gold hover:text-deep font-body font-semibold rounded-full transition-all duration-200"
          >
            {tNav('filterAll')} →
          </Link>
        </div>
      </div>
    </section>
  );
}
