import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

// Verify the request comes from an authenticated admin session
function isAuthorized(req: NextRequest): boolean {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const expected = process.env.NEXT_PUBLIC_ADMIN_HASH ?? '';
  return expected !== '' && token === expected;
}

// GET /api/products — returns ALL products (admin: including inactive)
export async function GET(req: NextRequest) {
  try {
    const db = getServiceClient();
    const { data, error } = await db
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('[GET /api/products]', err);
    return NextResponse.json([], { status: 200 }); // graceful fallback
  }
}

// PUT /api/products — save the full products array (upsert + remove deleted ones)
export async function PUT(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const products = await req.json();
    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const db = getServiceClient();
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Prepare products: strip base64 images, ensure slug, remove non-UUID ids
    const dbProducts = products.map((p: Record<string, unknown>) => {
      const base = {
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
      } as Record<string, unknown>;

      // Only include id if it's a valid UUID (non-UUID ids like '1','2' break Supabase)
      if (UUID_REGEX.test(String(p.id))) {
        base.id = p.id;
      }
      return base;
    });

    // Upsert by product_code — works for both seed products and new admin products
    const { error: upsertError } = await db
      .from('products')
      .upsert(dbProducts, { onConflict: 'product_code' });

    if (upsertError) {
      const msg = typeof upsertError === 'object'
        ? (upsertError as { message?: string }).message ?? JSON.stringify(upsertError)
        : String(upsertError);
      throw new Error(msg);
    }

    return NextResponse.json({ ok: true, count: products.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('[PUT /api/products]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/products — insert a single new product, returns it with DB-generated fields
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const product = await req.json();
    const db = getServiceClient();

    const toInsert = {
      ...product,
      images: (product.images as string[]).filter((img: string) => !img.startsWith('data:')),
      // Send empty product_code so the DB trigger auto-generates MKB-XXXX
      product_code: product.product_code?.startsWith('MKB-NEW-') ? '' : product.product_code,
    };

    const { data, error } = await db
      .from('products')
      .insert(toInsert)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('[POST /api/products]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
