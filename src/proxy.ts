import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { type NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // API routes, admin, icons — bypass i18n entirely
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname === '/icon' ||
    pathname === '/apple-icon' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Redirect locale-prefixed admin URLs (e.g. /fr/admin/login → /admin/login)
  if (/^\/(fr|en)\/admin/.test(pathname)) {
    const newPath = pathname.replace(/^\/(fr|en)\/admin/, '/admin');
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/',
    '/(fr|en)/:path*',
    // Skip Next.js internals, static files
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
};
