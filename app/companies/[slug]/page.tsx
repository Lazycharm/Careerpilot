/**
 * /companies/[slug]
 *
 * Public landing per Company (UAE employer). Pulls from the DB and pre-renders
 * at build time. New companies added through admin become available after the
 * next deploy (Next.js ISR could pick them up automatically — Phase 7b).
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SEOLanding } from '@/components/seo/SEOLanding'
import { StructuredData } from '@/components/seo/StructuredData'
import { generateStructuredData } from '@/lib/seo'
import { env } from '@/lib/env'

export const dynamic = 'force-static'
export const revalidate = 3600 // 1 hour ISR

export async function generateStaticParams() {
  const companies = await prisma.company.findMany({
    where: { isActive: true },
    select: { slug: true },
  })
  return companies.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const company = await prisma.company.findFirst({
    where: { slug: params.slug, isActive: true },
  })
  if (!company) return { title: 'Company not found' }
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  const desc =
    company.description?.slice(0, 160) ??
    `Tailored CV templates and application tips for ${company.name} roles in the UAE.`
  return {
    title: `${company.name} jobs — CV templates | CareerPilot`,
    description: desc,
    alternates: { canonical: `${base}/companies/${company.slug}` },
    openGraph: {
      title: `${company.name} jobs — CV templates`,
      description: desc,
      type: 'website',
      url: `${base}/companies/${company.slug}`,
      images: company.logoUrl ? [{ url: company.logoUrl }] : undefined,
    },
  }
}

export default async function CompanyLanding({ params }: { params: { slug: string } }) {
  const company = await prisma.company.findFirst({
    where: { slug: params.slug, isActive: true },
  })
  if (!company) notFound()

  const orgStructured = generateStructuredData('Organization', {
    name: company.name,
    description: company.description,
    url: `${env.NEXT_PUBLIC_SITE_URL}/companies/${company.slug}`,
    logo: company.logoUrl,
  })

  return (
    <>
      <StructuredData data={orgStructured} />
      <SEOLanding
        kicker={[company.category, company.hqCity, company.hqCountry]
          .filter(Boolean)
          .join(' · ')}
        heading={`Apply to ${company.name} — UAE CV tips`}
        intro={
          company.description ??
          `Tailor your CV for ${company.name} and increase the chance of a recruiter callback.`
        }
        bodyParagraphs={[
          company.description ??
            `${company.name} is one of the leading employers in its category in the UAE.`,
          `Recruiters at ${company.name} read CVs in seconds. Tailor your summary to mirror the language of the job ad, lead each role with quantified outcomes, and keep formatting ATS-safe. Our Tailored Pack does this in one click — including a company-specific cover letter.`,
          `If you're applying ${company.name === 'Emirates' || company.name === 'Etihad Airways' ? 'as cabin crew or ground operations' : 'across functions'}, the safest filter to clear is the first 8 seconds of recruiter skim. Lead with employer-relevant context, not personal objectives.`,
        ]}
        featuredTemplateKeys={['dubai-classic', 'gulf-modern']}
        relatedLinks={[
          ...(company.industry
            ? [
                {
                  href: `/resume-templates/${company.industry}`,
                  label: `${company.industry} CV templates`,
                },
              ]
            : []),
          { href: '/jobs/dubai', label: 'Dubai jobs' },
          { href: '/jobs/abu-dhabi', label: 'Abu Dhabi jobs' },
        ]}
      />
    </>
  )
}
