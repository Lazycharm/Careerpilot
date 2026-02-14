import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata = genMeta({
  title: 'Login to Career Pilot - Access Your UAE Resume Builder',
  description: 'Sign in to Career Pilot and access your ATS-optimized resume builder, cover letter generator, and interview preparation tools for UAE job seekers.',
  keywords: ['login', 'UAE resume builder login', 'Career Pilot login', 'resume builder account'],
  canonical: '/auth/login',
  noindex: true,
})

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

