import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata = genMeta({
  title: 'Sign Up for Career Pilot - Start Building Your UAE Resume',
  description: 'Create your free Career Pilot account and start building ATS-optimized resumes for Dubai, Abu Dhabi, and GCC job markets. Get access to AI-powered resume builder and interview prep tools.',
  keywords: ['sign up', 'register', 'UAE resume builder sign up', 'create account', 'free resume builder UAE'],
  canonical: '/auth/register',
})

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

