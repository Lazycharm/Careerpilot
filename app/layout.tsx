import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { generateMetadata as genMeta } from "@/lib/seo";
import { generateStructuredData } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = genMeta({
  title: "UAE Resume Builder | AI-Powered ATS Resume Builder for Dubai & Abu Dhabi Jobs",
  description: "Create ATS-optimized resumes for UAE employers. AI resume builder with professional CV templates for Dubai, Abu Dhabi jobs. Generate cover letters and ace interviews with our UAE-focused career platform.",
  keywords: [
    'UAE resume builder',
    'ATS resume builder',
    'AI resume builder',
    'resume builder UAE',
    'CV maker UAE',
    'professional CV UAE',
    'ATS-optimized resume',
    'Dubai job resume',
    'Abu Dhabi CV format',
    'GCC resume format',
    'interview preparation UAE',
    'resume templates ATS friendly',
    'cover letter generator UAE',
    'job interview questions UAE',
  ],
  canonical: "/",
});

const faqData = [
  {
    '@type': 'Question',
    name: 'What is the best resume builder for UAE jobs?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Career Pilot is the best resume builder for UAE jobs, offering ATS-optimized resume templates specifically designed for Dubai, Abu Dhabi, and GCC employers. Our AI-powered platform helps you create professional CVs that pass applicant tracking systems.',
    },
  },
  {
    '@type': 'Question',
    name: 'How do I create an ATS-friendly resume for Dubai?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Our AI resume builder automatically optimizes your resume for ATS systems used by UAE employers. Simply input your experience, and our platform will format it using ATS-friendly resume templates with proper keyword optimization for Dubai job applications.',
    },
  },
  {
    '@type': 'Question',
    name: 'Can I add a photo to my UAE resume?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Yes, Career Pilot offers optional profile photo support for your UAE resume. Our templates adapt cleanly whether you include a photo or not, ensuring your CV looks professional for Dubai and Abu Dhabi employers.',
    },
  },
  {
    '@type': 'Question',
    name: 'What resume format do UAE employers prefer?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'UAE employers prefer ATS-optimized resume formats with clear sections, professional formatting, and relevant keywords. Our GCC resume format templates are specifically designed for UAE job market standards and work culture.',
    },
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteStructuredData = generateStructuredData('WebSite', {
    name: 'Career Pilot',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://careerpilot.ae',
  });

  const softwareAppData = generateStructuredData('SoftwareApplication', {
    name: 'Career Pilot - UAE Resume Builder',
    description: 'AI-powered resume builder and career preparation platform for UAE job seekers',
    applicationCategory: 'BusinessApplication',
  });

  const faqStructuredData = generateStructuredData('FAQPage', {
    faqs: faqData,
  });

  return (
    <html lang="en">
      <head>
        <StructuredData data={websiteStructuredData} />
        <StructuredData data={softwareAppData} />
        <StructuredData data={faqStructuredData} />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

