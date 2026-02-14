import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata = genMeta({
  title: 'Resume Builder - Create ATS-Optimized Resumes for UAE Jobs',
  description: 'Build professional, ATS-optimized resumes for Dubai, Abu Dhabi, and GCC employers. Use our AI-powered resume builder with UAE-specific templates and keyword optimization.',
  keywords: ['resume builder', 'UAE resume builder', 'ATS resume builder', 'resume templates', 'CV maker UAE', 'professional CV'],
  canonical: '/resume',
  noindex: true,
})

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

