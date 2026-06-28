/**
 * /cv-for/[role]
 *
 * Programmatic SEO landing per job-title.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ROLES, findRole, findIndustry } from '@/lib/seo/data'
import { SEOLanding } from '@/components/seo/SEOLanding'
import { StructuredData } from '@/components/seo/StructuredData'
import { generateStructuredData } from '@/lib/seo'
import { env } from '@/lib/env'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return ROLES.map((r) => ({ role: r.slug }))
}

export function generateMetadata({
  params,
}: {
  params: { role: string }
}): Metadata {
  const role = findRole(params.role)
  if (!role) return { title: 'Role not found' }
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  return {
    title: `${role.title} CV Template — UAE | CareerPilot`,
    description: role.metaDescription,
    alternates: { canonical: `${base}/cv-for/${role.slug}` },
    openGraph: {
      title: `${role.title} CV Template — UAE`,
      description: role.metaDescription,
      type: 'website',
      url: `${base}/cv-for/${role.slug}`,
    },
  }
}

export default function RolePage({ params }: { params: { role: string } }) {
  const role = findRole(params.role)
  if (!role) notFound()

  const industry = findIndustry(role.industry)
  const breadcrumbs = generateStructuredData('BreadcrumbList', {
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: env.NEXT_PUBLIC_SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'CV templates by role',
        item: `${env.NEXT_PUBLIC_SITE_URL}/cv-for`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: role.title,
        item: `${env.NEXT_PUBLIC_SITE_URL}/cv-for/${role.slug}`,
      },
    ],
  })

  return (
    <>
      <StructuredData data={breadcrumbs} />
      <SEOLanding
        kicker={industry ? `${industry.name} · UAE` : 'UAE'}
        heading={`${role.title} CV template for UAE jobs`}
        intro={role.metaDescription}
        bodyParagraphs={role.body}
        featuredTemplateKeys={role.templateKeys}
        relatedLinks={[
          ...(industry
            ? [
                {
                  href: `/resume-templates/${industry.slug}`,
                  label: `${industry.name} CV templates`,
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
