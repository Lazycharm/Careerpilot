import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata = genMeta({
  title: 'Subscription Plans - Premium Access to UAE Resume Builder',
  description: 'Unlock unlimited downloads of ATS-optimized resumes and cover letters. Get premium access to AI-powered resume optimization and interview preparation tools for UAE job seekers.',
  keywords: ['subscription', 'premium', 'UAE resume builder subscription', 'resume builder pricing', 'career platform subscription'],
  canonical: '/subscription',
  noindex: true,
})

export default function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

