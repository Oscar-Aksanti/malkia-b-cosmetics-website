import { NextRequest, NextResponse } from 'next/server';
import { createHmac, randomBytes } from 'crypto';

/**
 * POST /api/admin/login
 * Body: { password: string }
 * Returns: { token: string } on success, 401 on failure.
 *
 * The token is: base64( timestamp ":" randomNonce ":" HMAC-SHA256(timestamp:nonce, ADMIN_SECRET) )
 * Valid for 24 hours.
 */

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';
const ADMIN_SECRET   = process.env.ADMIN_SECRET   ?? 'malkia-secret-change-me';

export async function POST(req: NextRequest) {
  // Rate-limit hint via header (actual rate limiting should be done at CDN/proxy level)
  const body = await req.json().catch(() => ({}));
  const { password } = body as { password?: string };

  if (!password || password !== ADMIN_PASSWORD) {
    // Consistent timing to prevent brute-force timing attacks
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 200));
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const timestamp = Date.now().toString();
  const nonce     = randomBytes(16).toString('hex');
  const payload   = `${timestamp}:${nonce}`;
  const signature = createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
  const token     = Buffer.from(`${payload}:${signature}`).toString('base64');

  return NextResponse.json({ token });
}
