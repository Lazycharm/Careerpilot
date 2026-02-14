'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const faqs: Record<string, FAQItem[]> = {
  'resume-builder': [
    {
      question: 'How do I create an ATS-optimized resume?',
      answer: 'Simply sign up for Career Pilot, choose a professional template, and fill in your information. Our AI-powered resume builder automatically formats your resume to pass applicant tracking systems (ATS) used by UAE employers. The platform ensures proper keyword optimization and formatting standards.',
    },
    {
      question: 'Can I add a photo to my resume?',
      answer: 'Yes, Career Pilot offers optional profile photo support. You can upload a professional photo, and our templates will adapt cleanly whether you include a photo or not. This feature is particularly useful for UAE job applications where photos are sometimes preferred.',
    },
    {
      question: 'What resume formats are supported?',
      answer: 'Career Pilot generates resumes in PDF format, which is the standard for job applications. Our templates are designed to be ATS-friendly and compatible with systems used by Dubai, Abu Dhabi, and GCC employers.',
    },
    {
      question: 'How many resumes can I create?',
      answer: 'You can create unlimited resumes with a free account. However, downloading resumes requires a premium subscription. This allows you to build and customize multiple resumes for different job applications.',
    },
  ],
  'ai-features': [
    {
      question: 'How does AI resume optimization work?',
      answer: 'Our AI analyzes your resume content and suggests improvements based on UAE job market standards. It optimizes keywords, improves bullet points with metrics and achievements, and ensures your resume passes ATS systems. You can preview all AI suggestions before applying them.',
    },
    {
      question: 'Can AI generate my entire resume?',
      answer: 'No, Career Pilot AI assists you in creating and optimizing your resume, but you maintain full control. The AI helps with professional summaries, bullet point improvements, and skill suggestions. You provide the actual experience and information.',
    },
    {
      question: 'Is my data safe with AI features?',
      answer: 'Yes, we take data privacy seriously. Your resume data is encrypted and stored securely. AI processing follows strict privacy guidelines, and we never share your information with third parties. See our Privacy Policy for more details.',
    },
    {
      question: 'Can I disable AI features?',
      answer: 'Yes, you can build your resume entirely without AI assistance. All AI features are optional and can be toggled on or off. You have full control over when and how to use AI suggestions.',
    },
  ],
  'interview-prep': [
    {
      question: 'How does interview preparation work?',
      answer: 'Career Pilot generates job-specific interview questions based on your target role, industry, and experience level. You can practice answering questions, receive AI-powered feedback on your responses, and get a readiness score to gauge your preparation level.',
    },
    {
      question: 'What types of questions are included?',
      answer: 'Our interview prep covers behavioral questions, technical questions (for relevant roles), situational questions, and UAE-specific interview scenarios. Questions are tailored to your job title and industry.',
    },
    {
      question: 'How accurate is the readiness score?',
      answer: 'The readiness score is based on AI analysis of your answers, considering factors like completeness, relevance, and structure. While it provides valuable feedback, it\'s a tool to help you prepare, not a guarantee of interview success.',
    },
    {
      question: 'Can I practice multiple times?',
      answer: 'Yes, you can create multiple interview sessions and practice as many times as you need. Each session generates new questions, allowing you to prepare thoroughly for your job interviews.',
    },
  ],
  'account-billing': [
    {
      question: 'How much does Career Pilot cost?',
      answer: 'Career Pilot offers a free account where you can build resumes and use basic features. To download resumes and access premium features, you need a premium subscription. Pricing is set by administrators and can be viewed on the subscription page.',
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'Career Pilot uses Ziina for secure payment processing. We accept major credit cards and other payment methods supported by Ziina in the UAE.',
    },
    {
      question: 'Can I cancel my subscription?',
      answer: 'Yes, subscriptions can be managed through your account. Contact support if you need assistance with cancellation or have questions about your subscription.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Refund policies are outlined in our Terms of Service. Generally, we offer refunds for subscription issues within a reasonable timeframe. Contact support for specific refund requests.',
    },
    {
      question: 'How do I update my account information?',
      answer: 'You can update your account information, including email and password, through your profile settings in the dashboard.',
    },
  ],
}

export default function FAQsPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggleItem = (category: string, index: number) => {
    const key = `${category}-${index}`
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="Career Pilot" 
                width={140}
                height={45}
                className="h-8 sm:h-10 md:h-11 w-auto"
                priority
              />
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-sm sm:text-base min-h-[44px] px-3 sm:px-4">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="text-sm sm:text-base min-h-[44px] px-3 sm:px-4">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about Career Pilot
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8 sm:space-y-12">
            {/* Resume Builder */}
            <section id="resume-builder">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
                <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                Resume Builder
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {faqs['resume-builder'].map((faq, index) => {
                  const key = `resume-builder-${index}`
                  const isOpen = openItems[key]
                  return (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader 
                        className="cursor-pointer"
                        onClick={() => toggleItem('resume-builder', index)}
                      >
                        <CardTitle className="text-base sm:text-lg flex items-center justify-between gap-4">
                          <span className="flex-1 text-left">{faq.question}</span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 flex-shrink-0" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      {isOpen && (
                        <CardContent className="pt-0">
                          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            {faq.answer}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            </section>

            {/* AI Features */}
            <section id="ai-features">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
                <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                AI Features
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {faqs['ai-features'].map((faq, index) => {
                  const key = `ai-features-${index}`
                  const isOpen = openItems[key]
                  return (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader 
                        className="cursor-pointer"
                        onClick={() => toggleItem('ai-features', index)}
                      >
                        <CardTitle className="text-base sm:text-lg flex items-center justify-between gap-4">
                          <span className="flex-1 text-left">{faq.question}</span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 flex-shrink-0" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      {isOpen && (
                        <CardContent className="pt-0">
                          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            {faq.answer}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            </section>

            {/* Interview Prep */}
            <section id="interview-prep">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
                <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                Interview Preparation
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {faqs['interview-prep'].map((faq, index) => {
                  const key = `interview-prep-${index}`
                  const isOpen = openItems[key]
                  return (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader 
                        className="cursor-pointer"
                        onClick={() => toggleItem('interview-prep', index)}
                      >
                        <CardTitle className="text-base sm:text-lg flex items-center justify-between gap-4">
                          <span className="flex-1 text-left">{faq.question}</span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 flex-shrink-0" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      {isOpen && (
                        <CardContent className="pt-0">
                          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            {faq.answer}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            </section>

            {/* Account & Billing */}
            <section id="account-billing">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
                <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                Account & Billing
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {faqs['account-billing'].map((faq, index) => {
                  const key = `account-billing-${index}`
                  const isOpen = openItems[key]
                  return (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader 
                        className="cursor-pointer"
                        onClick={() => toggleItem('account-billing', index)}
                      >
                        <CardTitle className="text-base sm:text-lg flex items-center justify-between gap-4">
                          <span className="flex-1 text-left">{faq.question}</span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 flex-shrink-0" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      {isOpen && (
                        <CardContent className="pt-0">
                          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            {faq.answer}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            </section>
          </div>

          {/* Still Need Help */}
          <Card className="mt-8 sm:mt-12 bg-blue-50 border-blue-200">
            <CardContent className="p-6 sm:p-8 text-center">
              <p className="text-gray-700 text-sm sm:text-base mb-4">
                Still have questions? Our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg" className="min-h-[48px] w-full sm:w-auto">
                    Contact Support
                  </Button>
                </Link>
                <Link href="/help">
                  <Button variant="outline" size="lg" className="min-h-[48px] w-full sm:w-auto">
                    Back to Help Center
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Career Pilot</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                AI-powered resume builder and career readiness platform for UAE job seekers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                <li><Link href="/products" className="hover:text-primary transition-colors">Products</Link></li>
                <li><Link href="/#how-it-works" className="hover:text-primary transition-colors">Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t text-center text-xs sm:text-sm text-gray-600">
            © {new Date().getFullYear()} Career Pilot - UAE Resume Builder & ATS-Optimized CV Maker. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

