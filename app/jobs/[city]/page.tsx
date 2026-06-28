/**
 * /jobs/[city]
 *
 * Programmatic SEO landing per UAE emirate.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CITIES, findCity, findIndustry } from '@/lib/seo/data'
import { SEOLanding } from '@/components/seo/SEOLanding'
import { env } from '@/lib/env'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }))
}

export function generateMetadata({
  params,
}: {
  params: { city: string }
}): Metadata {
  const city = findCity(params.city)
  if (!city) return { title: 'City not found' }
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  return {
    title: `${city.name} jobs CV templates | CareerPilot`,
    description: city.metaDescription,
    alternates: { canonical: `${base}/jobs/${city.slug}` },
    openGraph: {
      title: `${city.name} jobs — CV templates`,
      description: city.metaDescription,
      type: 'website',
      url: `${base}/jobs/${city.slug}`,
    },
  }
}

export default function CityPageView({ params }: { params: { city: string } }) {
  const city = findCity(params.city)
  if (!city) notFound()

  const relatedIndustries = city.industries
    .map((slug) => findIndustry(slug))
    .filter(Boolean) as NonNullable<ReturnType<typeof findIndustry>>[]

  return (
    <SEOLanding
      kicker={`${city.name} · UAE`}
      heading={`CV templates for ${city.name} jobs`}
      intro={city.metaDescription}
      bodyParagraphs={city.body}
      relatedLinks={relatedIndustries.map((i) => ({
        href: `/resume-templates/${i.slug}`,
        label: `${i.name} CV templates`,
      }))}
    />
  )
}
