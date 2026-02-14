import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata = genMeta({
  title: 'Dashboard - Manage Your UAE Resume Builder Account',
  description: 'Access your ATS-optimized resumes, cover letters, and interview preparation sessions. Track your progress and manage your UAE career tools.',
  keywords: ['dashboard', 'resume builder dashboard', 'UAE career dashboard', 'resume management'],
  canonical: '/dashboard',
  noindex: true,
})

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

