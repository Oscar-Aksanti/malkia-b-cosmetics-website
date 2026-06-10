export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

/**
 * POST /api/admin/verify
 * Body: { token: string }
 * Returns: { valid: true } or { valid: false }
 *
 * Token format (base64): timestamp ":" nonce ":" HMAC-SHA256(timestamp:nonce, ADMIN_SECRET)
 * Expires after 24 hours.
 */

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? 'malkia-secret-change-me';
const TTL_MS       = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { token } = body as { token?: string };

  if (!token) return NextResponse.json({ valid: false });

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts   = decoded.split(':');
    if (parts.length !== 3) return NextResponse.json({ valid: false });

    const [timestamp, nonce, signature] = parts;
    const payload   = `${timestamp}:${nonce}`;
    const expected  = createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');

    if (signature !== expected) return NextResponse.json({ valid: false });

    const age = Date.now() - parseInt(timestamp, 10);
    if (age > TTL_MS || age < 0) return NextResponse.json({ valid: false });

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
