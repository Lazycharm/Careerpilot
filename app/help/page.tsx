import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { generateMetadata as genMeta } from '@/lib/seo'
import { HelpCircle, MessageSquare, FileText, Search } from 'lucide-react'

export const metadata = genMeta({
  title: 'Help Center - Support & FAQs for Career Pilot',
  description: 'Get help with Career Pilot resume builder, AI features, interview preparation, and account management. Find answers to frequently asked questions.',
  keywords: ['help center', 'support', 'FAQs', 'resume builder help', 'Career Pilot support'],
  canonical: '/help',
})

export default function HelpPage() {
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
              Help Center
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions and get support for Career Pilot
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <Link href="/help/faqs" className="block">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <HelpCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Frequently Asked Questions</CardTitle>
                  <CardDescription className="text-sm">
                    Browse common questions and answers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full min-h-[44px]">
                    View FAQs
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/contact" className="block">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Contact Support</CardTitle>
                  <CardDescription className="text-sm">
                    Get in touch with our support team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full min-h-[44px]">
                    Contact Us
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Help Categories */}
          <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Getting Started
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm sm:text-base mb-4">
                  New to Career Pilot? Learn how to create your first ATS-optimized resume and get started with our platform.
                </p>
                <Link href="/help/faqs#resume-builder">
                  <Button variant="link" className="p-0 h-auto text-sm sm:text-base">
                    Learn more →
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-3">
                  <Search className="w-6 h-6 text-purple-600" />
                  Common Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm sm:text-base">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">•</span>
                    <Link href="/help/faqs#resume-builder" className="hover:text-primary transition-colors">
                      Resume Builder Questions
                    </Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">•</span>
                    <Link href="/help/faqs#ai-features" className="hover:text-primary transition-colors">
                      AI Features & Optimization
                    </Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">•</span>
                    <Link href="/help/faqs#interview-prep" className="hover:text-primary transition-colors">
                      Interview Preparation
                    </Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">•</span>
                    <Link href="/help/faqs#account-billing" className="hover:text-primary transition-colors">
                      Account & Billing
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Support Note */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 sm:p-8 text-center">
              <p className="text-gray-700 text-sm sm:text-base mb-4">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help.
              </p>
              <Link href="/contact">
                <Button size="lg" className="min-h-[48px]">
                  Contact Support
                </Button>
              </Link>
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

