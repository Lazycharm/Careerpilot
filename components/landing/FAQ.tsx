'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'What is an ATS-friendly resume?',
    answer: 'ATS (Applicant Tracking System) is software that employers use to filter resumes before a human ever sees them. An ATS-friendly resume uses proper formatting, keywords, and structure so it passes these filters. Every Career Pilot template is designed to score high on ATS scans.',
  },
  {
    question: 'What do I get with a subscription?',
    answer: 'A subscription unlocks PDF downloads, unlimited AI-powered content generation, premium templates, cover letter creation, and interview prep with readiness scoring. You can explore the builder before subscribing — and unlock everything when you\'re ready to apply.',
  },
  {
    question: 'Can I upload my existing resume?',
    answer: 'Yes. Upload your existing resume and our AI will parse it into an editable format. You can then improve it with our AI suggestions, change templates, and optimize it for ATS compatibility.',
  },
  {
    question: 'How does the AI improve my resume?',
    answer: 'Our AI analyzes your experience and generates keyword-optimized bullet points, professional summaries, and skill suggestions tailored to your target role. It can also tailor your resume to match specific job postings.',
  },
  {
    question: 'Is my data safe?',
    answer: 'Your data is encrypted and securely stored. We never share your personal information with third parties. You can delete your account and all associated data at any time.',
  },
  {
    question: 'What makes Career Pilot different from other resume builders?',
    answer: 'Career Pilot is built specifically for the UAE and GCC job market. Beyond resume building, we offer AI-powered cover letter generation, interview preparation with readiness scoring, and career guidance — everything you need in one platform.',
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left min-h-[48px]"
        aria-expanded={isOpen}
      >
        <span className="text-sm sm:text-base font-medium pr-4">{question}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 flex-shrink-0 text-gray-500 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        )}
      >
        <p className="text-sm text-gray-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

export function FAQ() {
  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            Frequently asked questions
          </h2>
          <p className="text-gray-600">
            Everything you need to know before getting started
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 divide-y-0 px-6">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}
