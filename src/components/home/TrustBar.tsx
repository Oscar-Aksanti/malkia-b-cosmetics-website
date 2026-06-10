import { getTranslations } from 'next-intl/server';
import { Award, Truck, Headphones, Globe } from 'lucide-react';

export default async function TrustBar() {
  const t = await getTranslations('trustBar');

  const items = [
    { Icon: Award,      text: t('since')    },
    { Icon: Truck,      text: t('delivery') },
    { Icon: Headphones, text: t('service')  },
    { Icon: Globe,      text: t('online')   },
  ];

  return (
    <div className="bg-gold overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 py-4">
          {items.map(({ Icon, text }, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <Icon className="w-4 h-4 text-deep/70 flex-shrink-0" />
              <span className="font-body text-sm font-semibold text-deep uppercase tracking-wider whitespace-nowrap">
                {text}
              </span>
              {i < items.length - 1 && (
                <span className="hidden md:block w-px h-4 bg-deep/20 ml-6" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
