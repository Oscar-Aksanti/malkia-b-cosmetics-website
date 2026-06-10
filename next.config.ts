import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // ── Security headers ────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent MIME type sniffing
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          // Prevent clickjacking
          { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
          // Basic XSS filter (legacy browsers)
          { key: 'X-XSS-Protection',          value: '1; mode=block' },
          // Don't send Referer header to external sites
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          // Restrict browser features
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
          // Force HTTPS (enable only once site is live on HTTPS)
          // { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      {
        // No caching for API routes
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
