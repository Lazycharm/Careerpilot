import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://careerpilot.ae'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/', '/resume/', '/cover-letter/', '/interview/'],
      },
      {
        userAgent: '*',
        allow: ['/auth/login', '/auth/register'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

