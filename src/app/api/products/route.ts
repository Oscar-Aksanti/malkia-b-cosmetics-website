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

    // Strip base64 images before saving to DB (they belong in localStorage only)
    const dbProducts = products.map((p) => ({
      ...p,
      images: (p.images as string[]).filter((img: string) => !img.startsWith('data:')),
      // Ensure slug exists
      slug: p.slug || p.product_code.toLowerCase().replace(/-/g, '') + '-' + p.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    }));

    // Upsert all products (insert new, update existing by id)
    const { error: upsertError } = await db
      .from('products')
      .upsert(dbProducts, { onConflict: 'id' });

    if (upsertError) throw upsertError;

    // Delete products that are in the DB but not in the new list
    const { data: existingInDB } = await db.from('products').select('id');
    const newIds = new Set(products.map((p: { id: string }) => p.id));
    const toDelete = (existingInDB ?? [])
      .map((r: { id: string }) => r.id)
      .filter((id: string) => !newIds.has(id));

    if (toDelete.length > 0) {
      const { error: deleteError } = await db
        .from('products')
        .delete()
        .in('id', toDelete);
      if (deleteError) console.warn('[DELETE products]', deleteError);
    }

    return NextResponse.json({ ok: true, count: products.length });
  } catch (err) {
    console.error('[PUT /api/products]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
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
