import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

const BUCKET = 'product-images';

function isAuthorized(req: NextRequest): boolean {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const expected = process.env.NEXT_PUBLIC_ADMIN_HASH ?? '';
  return expected !== '' && token === expected;
}

// POST /api/upload — upload image to Supabase Storage, return public URL
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const db = getSupabaseClient();
    if (!db) throw new Error('Supabase not configured');
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await db.storage
      .from(BUCKET)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) throw new Error(error.message);

    const { data: { publicUrl } } = db.storage
      .from(BUCKET)
      .getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('[POST /api/upload]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
