/** @type {import('next').NextConfig} */

// ─── Security headers ───────────────────────────────────────────────────────
// CSP intentionally permissive for first deploy; tighten once we audit all
// third-party origins (Supabase, Resend, Sentry, Ziina, Anthropic, OpenAI).

const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // CSP is added as a non-blocking report-only header initially — flip to
  // Content-Security-Policy after a week of clean reports.
  {
    key: 'Content-Security-Policy-Report-Only',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.sentry.io https://*.vercel.app",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://api.openai.com https://api-v2.ziina.com https://*.sentry.io https://*.upstash.io",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'careerpilot.ae' },
      { protocol: 'https', hostname: 'www.careerpilot.ae' },
    ],
  },

  experimental: {
    serverActions: { bodySizeLimit: '4mb' },
    // Keep heavy native deps out of the standard bundle path.
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
