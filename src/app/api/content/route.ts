import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { DEFAULT_CONTENT, type ContentSettings } from '@/lib/content-storage';

function isAuthorized(req: NextRequest): boolean {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const expected = process.env.NEXT_PUBLIC_ADMIN_HASH ?? '';
  return expected !== '' && token === expected;
}

// Content keys stored in site_settings table
const CONTENT_KEYS: (keyof ContentSettings)[] = [
  'heroFr1', 'heroFr2', 'heroSubFr',
  'heroEn1', 'heroEn2', 'heroSubEn',
  'badge', 'cta1Fr', 'cta2Fr',
  'slogans',
];

// GET /api/content — returns content settings from site_settings table
export async function GET() {
  try {
    const db = getSupabaseClient();
    if (!db) throw new Error('Supabase not configured');
    const { data, error } = await db
      .from('site_settings')
      .select('key, value')
      .in('key', CONTENT_KEYS);

    if (error) throw error;

    const result: ContentSettings = { ...DEFAULT_CONTENT };
    for (const row of data ?? []) {
      const key = row.key as keyof ContentSettings;
      if (key === 'slogans') {
        try { result.slogans = JSON.parse(row.value); } catch { /* keep default */ }
      } else {
        (result as unknown as Record<string, unknown>)[key] = row.value;
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[GET /api/content]', err);
    return NextResponse.json(DEFAULT_CONTENT); // graceful fallback
  }
}

// PUT /api/content — save content settings to site_settings table
export async function PUT(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings: ContentSettings = await req.json();
    const db = getSupabaseClient();
    if (!db) throw new Error('Supabase not configured');

    const rows = CONTENT_KEYS.map((key) => ({
      key,
      value: key === 'slogans'
        ? JSON.stringify(settings.slogans)
        : String((settings as unknown as Record<string, unknown>)[key] ?? ''),
    }));

    const { error } = await db
      .from('site_settings')
      .upsert(rows, { onConflict: 'key' });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PUT /api/content]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
