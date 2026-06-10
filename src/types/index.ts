/* ─────────────────────────────────────────────────────────────────────────────
   MALKIA B COSMETICS — Global TypeScript Types
───────────────────────────────────────────────────────────────────────────── */

export type Locale = 'fr' | 'en';

export type Category = 'body' | 'face' | 'fragrance' | 'wellness';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

/* ── Product ──────────────────────────────────────────────────────────────── */
export interface Product {
  id: string;
  product_code: string;           // e.g. "MKB-0042"
  name_fr: string;
  name_en: string;
  description_fr?: string;
  description_en?: string;
  category: Category;
  price_usd: number;
  images: string[];               // array of image URLs / paths
  stock_status: StockStatus;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  slug?: string;
}

/* ── Cart ─────────────────────────────────────────────────────────────────── */
export interface CartItem {
  id: string;                     // product id
  product_code: string;
  name: string;                   // localised name
  price_usd: number;
  quantity: number;
  image?: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

export type CartAction =
  | { type: 'ADD_ITEM';    payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QTY';  payload: { id: string; quantity: number } }
  | { type: 'CLEAR' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'HYDRATE';     payload: CartItem[] };

/* ── Order Attempt ────────────────────────────────────────────────────────── */
export interface OrderAttemptItem {
  product_code: string;
  name: string;
  quantity: number;
  price_usd: number;
}

export interface OrderAttempt {
  id: string;
  items: OrderAttemptItem[];
  total_usd: number;
  language: Locale;
  device: 'mobile' | 'desktop';
  status: OrderStatus;
  notes?: string;
  created_at: string;
}

/* ── Site Settings ────────────────────────────────────────────────────────── */
export interface SiteSetting {
  key: string;
  value: string;
  updated_at: string;
}

/* ── Testimonial ──────────────────────────────────────────────────────────── */
export interface Testimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
  product?: string;
}

/* ── Navigation Link ──────────────────────────────────────────────────────── */
export interface NavLink {
  href: string;
  label: string;
}
