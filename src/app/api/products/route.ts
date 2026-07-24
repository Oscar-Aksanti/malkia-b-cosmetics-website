import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

function isAuthorized(req: NextRequest): boolean {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const expected = process.env.NEXT_PUBLIC_ADMIN_HASH ?? '';
  return expected !== '' && token === expected;
}

function getDB() {
  const db = getSupabaseClient();
  if (!db) throw new Error('Supabase not configured');
  return db;
}

// GET /api/products
export async function GET() {
  try {
    const db = getDB();
    const { data, error } = await db
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('[GET /api/products]', err);
    return NextResponse.json([], { status: 200 });
  }
}

// PUT /api/products — upsert full catalog
export async function PUT(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const products = await req.json();
    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const db = getDB();
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    const dbProducts = products.map((p: Record<string, unknown>) => {
      const base: Record<string, unknown> = {
        product_code:   p.product_code,
        name_fr:        p.name_fr,
        name_en:        p.name_en,
        description_fr: p.description_fr,
        description_en: p.description_en,
        category:       p.category,
        price_usd:      p.price_usd,
        images:         (p.images as string[]).filter((img: string) => !img.startsWith('data:')),
        stock_status:   p.stock_status,
        is_active:      p.is_active,
        is_featured:    p.is_featured,
      };
      if (UUID_REGEX.test(String(p.id))) base.id = p.id;
      return base;
    });

    const { error: upsertError } = await db
      .from('products')
      .upsert(dbProducts, { onConflict: 'product_code' });

    if (upsertError) {
      const msg = (upsertError as { message?: string }).message ?? JSON.stringify(upsertError);
      throw new Error(msg);
    }

    return NextResponse.json({ ok: true, count: products.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('[PUT /api/products]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/products — insert single product
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const product = await req.json();
    const db = getDB();
    const toInsert = {
      ...product,
      images: (product.images as string[]).filter((img: string) => !img.startsWith('data:')),
      product_code: product.product_code?.startsWith('MKB-NEW-') ? '' : product.product_code,
    };
    const { data, error } = await db.from('products').insert(toInsert).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('[POST /api/products]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
