import { Metadata } from 'next'

export interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  noindex?: boolean
  structuredData?: object
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    canonical,
    ogImage = '/logo.png',
    noindex = false,
  } = config

  const fullTitle = title.includes('Career Pilot') ? title : `${title} | Career Pilot`
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://careerpilot.ae'

  return {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
      },
    },
    alternates: {
      canonical: canonical || `${siteUrl}${canonical || ''}`,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical || `${siteUrl}${canonical || ''}`,
      siteName: 'Career Pilot',
      images: [
        {
          url: ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`],
    },
  }
}

export function generateStructuredData(type: 'WebSite' | 'SoftwareApplication' | 'FAQPage', data: any) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://careerpilot.ae'

  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': type,
  }

  switch (type) {
    case 'WebSite':
      return {
        ...baseStructuredData,
        name: 'Career Pilot',
        url: siteUrl,
        description: 'AI-powered resume builder and career preparation platform for UAE job seekers',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
        ...data,
      }

    case 'SoftwareApplication':
      return {
        ...baseStructuredData,
        name: 'Career Pilot',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'AED',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '1250',
        },
        ...data,
      }

    case 'FAQPage':
      return {
        ...baseStructuredData,
        mainEntity: data.faqs || [],
      }

    default:
      return baseStructuredData
  }
}

