import { createClient } from '@supabase/supabase-js';
import type { Product, OrderAttempt, SiteSetting } from '@/types';

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL     ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/* ── Public (anon) client — lazy so it doesn't throw when env vars absent ── */
let _supabase: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!_supabase) _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

/** @deprecated Use getSupabaseClient() which gracefully handles missing env vars */
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as unknown as ReturnType<typeof createClient>;

/* ── Server (service role) client — used in API routes only ──────────────── */
export const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error('Supabase service role credentials not configured');
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

/* ── Typed database interface ─────────────────────────────────────────────── */
export type Database = {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'product_code' | 'created_at'>;
        Update: Partial<Omit<Product, 'id' | 'product_code' | 'created_at'>>;
      };
      order_attempts: {
        Row: OrderAttempt;
        Insert: Omit<OrderAttempt, 'id' | 'created_at'>;
        Update: Partial<Omit<OrderAttempt, 'id' | 'created_at'>>;
      };
      site_settings: {
        Row: SiteSetting;
        Insert: Omit<SiteSetting, 'updated_at'>;
        Update: Partial<Omit<SiteSetting, 'updated_at'>>;
      };
    };
  };
};

/* ── Product helpers (fall back to static data when Supabase not configured) ─ */
export async function getProducts(category?: string): Promise<Product[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  let query = client
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Product[];
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(4);

  if (error) throw error;
  return data as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) return null;
  return data as Product;
}

/* ── Order attempt logger ─────────────────────────────────────────────────── */
export async function logOrderAttempt(
  payload: Omit<OrderAttempt, 'id' | 'created_at'>
) {
  const client = getSupabaseClient();
  if (!client) {
    // Supabase not configured — log locally in dev only
    if (process.env.NODE_ENV === 'development') {
      console.info('[logOrderAttempt] (no Supabase):', payload);
    }
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (client as any).from('order_attempts').insert(payload);
  if (error) console.error('[Supabase] logOrderAttempt:', (error as any).message);
}
