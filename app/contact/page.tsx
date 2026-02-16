import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { generateMetadata as genMeta } from '@/lib/seo'
import { Mail, MessageCircle, Clock } from 'lucide-react'

export const metadata = genMeta({
  title: 'Contact Us - Get Support for Career Pilot',
  description: 'Contact Career Pilot support team via email or WhatsApp. Get help with your resume builder, account questions, or technical issues. We respond within 24 hours on business days.',
  keywords: ['contact Career Pilot', 'support', 'help', 'customer service', 'resume builder support'],
  canonical: '/contact',
})

export default function ContactPage() {
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
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Get in touch with our support team. We&apos;re here to help with any questions or issues.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* Email Support */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Email Support</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Send us an email and we&apos;ll get back to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="mailto:support@careerpilot.ai" 
                  className="text-blue-600 hover:text-blue-700 font-medium text-base sm:text-lg break-all"
                >
                  support@careerpilot.ai
                </a>
                <a href="mailto:support@careerpilot.ai" className="block mt-4">
                  <Button className="w-full min-h-[44px]">
                    Send Email
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* WhatsApp Support */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">WhatsApp Support</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Chat with us on WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm sm:text-base mb-4">
                  Click the button below to start a conversation on WhatsApp
                </p>
                <a 
                  href="https://wa.me/971501234567?text=Hello%2C%20I%20need%20help%20with%20Career%20Pilot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full min-h-[44px] bg-green-600 hover:bg-green-700">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat on WhatsApp
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Response Time */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2">Response Time</h3>
                  <p className="text-gray-700 text-sm sm:text-base">
                    Our support team responds within 24 hours on business days (Sunday - Thursday, UAE time).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Help */}
          <Card className="mt-6 sm:mt-8">
            <CardContent className="p-6 sm:p-8 text-center">
              <h3 className="font-semibold text-base sm:text-lg mb-4">Need Immediate Help?</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-6">
                Check out our Help Center for answers to common questions
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/help">
                  <Button variant="outline" size="lg" className="min-h-[48px] w-full sm:w-auto">
                    Visit Help Center
                  </Button>
                </Link>
                <Link href="/help/faqs">
                  <Button variant="outline" size="lg" className="min-h-[48px] w-full sm:w-auto">
                    View FAQs
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

