import type { CartItem, Locale } from '@/types';

/* ── Config ───────────────────────────────────────────────────────────────── */
export const WHATSAPP_NUMBER = '243995945889'; // hardcoded fallback — never change

/* ── Message Generator ────────────────────────────────────────────────────── */
export function generateOrderMessage(items: CartItem[], locale: Locale): string {
  const total = items.reduce(
    (sum, item) => sum + item.price_usd * item.quantity,
    0
  );

  const itemLines = items
    .map(
      (item) =>
        `🛍️ ${item.product_code} — ${item.name} x${item.quantity} — ${(
          item.price_usd * item.quantity
        ).toFixed(2)} USD`
    )
    .join('\n');

  if (locale === 'en') {
    return (
      `Hello Malkia B Cosmetics! 👋\n\n` +
      `I'd like to place the following order:\n\n` +
      `${itemLines}\n\n` +
      `💰 Estimated Total: ${total.toFixed(2)} USD\n\n` +
      `📦 Delivery: Worldwide Delivery available\n` +
      `📍 City / Country: [to be filled]\n\n` +
      `Please confirm availability, delivery time and payment options. 🙏`
    );
  }

  return (
    `Bonjour Malkia B Cosmetics ! 👋\n\n` +
    `Je souhaite passer la commande suivante :\n\n` +
    `${itemLines}\n\n` +
    `💰 Total estimé : ${total.toFixed(2)} USD\n\n` +
    `📦 Livraison : Worldwide Delivery disponible\n` +
    `📍 Ville / Pays : [à compléter par le client]\n\n` +
    `Merci de confirmer la disponibilité, le délai de livraison et les modalités de paiement. 🙏`
  );
}

export function generateGreetingMessage(locale: Locale): string {
  if (locale === 'en') {
    return `Hello Malkia B Cosmetics! 👋\n\nI'd like some information about your products.\n\nThank you!`;
  }
  return `Bonjour Malkia B Cosmetics ! 👋\n\nJe souhaite des informations sur vos produits.\n\nMerci !`;
}

/* ── WhatsApp URL builder ─────────────────────────────────────────────────── */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/* ── Open WhatsApp in new tab ─────────────────────────────────────────────── */
export function openWhatsApp(message: string): void {
  window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
}

/* ── Detect device ────────────────────────────────────────────────────────── */
export function getDeviceType(): 'mobile' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    ? 'mobile'
    : 'desktop';
}
