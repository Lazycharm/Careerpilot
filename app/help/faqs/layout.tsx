import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata = genMeta({
  title: 'FAQs - Frequently Asked Questions about Career Pilot',
  description: 'Find answers to common questions about Career Pilot resume builder, AI features, interview preparation, account management, and billing.',
  keywords: ['FAQs', 'frequently asked questions', 'resume builder FAQs', 'Career Pilot help', 'support questions'],
  canonical: '/help/faqs',
})

export default function FAQsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

