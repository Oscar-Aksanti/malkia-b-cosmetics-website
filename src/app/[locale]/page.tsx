import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import HeroSection         from '@/components/home/HeroSection';
import TrustBar            from '@/components/home/TrustBar';
import BestSellers         from '@/components/home/BestSellers';
import BrandStory          from '@/components/home/BrandStory';
import SlogansCarousel     from '@/components/home/SlogansCarousel';
import CategoriesSection   from '@/components/home/CategoriesSection';
import LifestyleGallery    from '@/components/home/LifestyleGallery';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import StoreLocator        from '@/components/home/StoreLocator';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hero' });
  return {
    title: 'Malkia B Cosmetics — True Beauty Comes From Within',
    description: t('subtitle'),
  };
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <BestSellers />
      <BrandStory />
      <SlogansCarousel />
      <CategoriesSection />
      <LifestyleGallery />
      <TestimonialsSection />
      <StoreLocator />
    </>
  );
}
