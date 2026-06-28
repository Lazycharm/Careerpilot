/**
 * /resume-templates/[industry]
 *
 * Programmatic SEO landing page per UAE industry. Reads from the curated
 * lib/seo/data.ts at first; future Phase 7b will merge admin overrides from
 * the IndustryPage table.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { INDUSTRIES, findIndustry } from '@/lib/seo/data'
import { SEOLanding } from '@/components/seo/SEOLanding'
import { StructuredData } from '@/components/seo/StructuredData'
import { generateStructuredData } from '@/lib/seo'
import { env } from '@/lib/env'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ industry: i.slug }))
}

export function generateMetadata({
  params,
}: {
  params: { industry: string }
}): Metadata {
  const ind = findIndustry(params.industry)
  if (!ind) return { title: 'Industry not found' }
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  return {
    title: `${ind.name} CV Templates — UAE | CareerPilot`,
    description: ind.metaDescription,
    alternates: { canonical: `${base}/resume-templates/${ind.slug}` },
    openGraph: {
      title: `${ind.name} CV Templates — UAE`,
      description: ind.metaDescription,
      type: 'website',
      url: `${base}/resume-templates/${ind.slug}`,
    },
  }
}

export default function IndustryPage({ params }: { params: { industry: string } }) {
  const ind = findIndustry(params.industry)
  if (!ind) notFound()

  const faqStructured = generateStructuredData('FAQPage', {
    faqs: ind.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  })

  return (
    <>
      <StructuredData data={faqStructured} />
      <SEOLanding
        kicker={`${ind.name} · UAE`}
        heading={`${ind.name} CV templates for the UAE`}
        intro={ind.metaDescription}
        bodyParagraphs={ind.body}
        featuredTemplateKeys={ind.templateKeys}
        faqs={ind.faqs}
        relatedLinks={[
          { href: '/jobs/dubai', label: 'Dubai jobs' },
          { href: '/jobs/abu-dhabi', label: 'Abu Dhabi jobs' },
          { href: '/cv-for/software-engineer', label: 'Software Engineer CV' },
          { href: '/cv-for/accountant', label: 'Accountant CV' },
        ]}
      />
    </>
  )
}
