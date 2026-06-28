// robots.txt configuration — blocks private routes from crawlers

import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://careerpilot.ae').replace(
    /\/$/,
    ''
  )
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/auth/login', '/auth/register'],
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/resume/',
          '/cover-letter/',
          '/interview/',
          '/documents/',
          '/automation/',
          '/subscription/',
          '/payments/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
