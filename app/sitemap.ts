/**
 * Sitemap — extended in Phase 7 to include programmatic SEO surfaces
 * (industry, role, city, company landing pages) and published blog posts.
 *
 * Private / auth-gated routes (dashboard, resume editor, admin, API) are
 * deliberately omitted; they're disallowed by robots.txt anyway. We keep
 * the high-intent public marketing routes (login, register) so search can
 * reach them through the site graph.
 */

import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { INDUSTRIES, ROLES, CITIES } from '@/lib/seo/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://careerpilot.ae').replace(
    /\/$/,
    ''
  )
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/auth/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/auth/register`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/products`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/help`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/help/faqs`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const industryRoutes: MetadataRoute.Sitemap = INDUSTRIES.map((i) => ({
    url: `${baseUrl}/resume-templates/${i.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const roleRoutes: MetadataRoute.Sitemap = ROLES.map((r) => ({
    url: `${baseUrl}/cv-for/${r.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const cityRoutes: MetadataRoute.Sitemap = CITIES.map((c) => ({
    url: `${baseUrl}/jobs/${c.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // Companies + blog posts pulled from the DB. Wrap in try so a transient
  // DB hiccup at build time doesn't crash the sitemap generator.
  let companyRoutes: MetadataRoute.Sitemap = []
  let blogRoutes: MetadataRoute.Sitemap = []
  try {
    const [companies] = await Promise.all([
      prisma.company.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
    ])
    companyRoutes = companies.map((c) => ({
      url: `${baseUrl}/companies/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
    blogRoutes = ([] as { slug: string; updatedAt: Date }[]).map((p) => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch (err) {
    console.error('[sitemap] DB fetch failed; emitting static-only sitemap', err)
  }

  return [
    ...staticRoutes,
    ...industryRoutes,
    ...roleRoutes,
    ...cityRoutes,
    ...companyRoutes,
    ...blogRoutes,
  ]
}
