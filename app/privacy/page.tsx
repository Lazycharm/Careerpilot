import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata = genMeta({
  title: 'Privacy Policy - Career Pilot Data Protection & Privacy',
  description: 'Read Career Pilot privacy policy to understand how we collect, use, and protect your personal information and resume data.',
  keywords: ['privacy policy', 'data protection', 'Career Pilot privacy', 'user data security'],
  canonical: '/privacy',
})

export default function PrivacyPage() {
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
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Privacy Policy
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6 sm:space-y-8">
            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">1. Introduction</h2>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
                  Career Pilot ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered resume builder and career preparation platform.
                </p>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  By using Career Pilot, you agree to the collection and use of information in accordance with this policy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">2. Information We Collect</h2>
                <div className="space-y-4 text-sm sm:text-base">
                  <div>
                    <h3 className="font-semibold mb-2">Personal Information</h3>
                    <p className="text-gray-700 leading-relaxed">
                      We collect information that you provide directly to us, including:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700 ml-4">
                      <li>Name, email address, and contact information</li>
                      <li>Resume data and professional information</li>
                      <li>Account credentials and preferences</li>
                      <li>Payment information (processed securely through third-party providers)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Usage Data</h3>
                    <p className="text-gray-700 leading-relaxed">
                      We automatically collect information about how you use our platform, including pages visited, features used, and time spent on the platform.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm sm:text-base ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process your resume creation and optimization requests</li>
                  <li>Enable AI-powered features and suggestions</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Send you service-related communications</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Detect and prevent fraud or abuse</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">4. Data Security</h2>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">5. Data Retention</h2>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">6. Your Rights</h2>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm sm:text-base ml-4">
                  <li>Access and receive a copy of your personal data</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your personal data</li>
                  <li>Object to processing of your personal data</li>
                  <li>Request restriction of processing</li>
                  <li>Data portability</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">7. Contact Us</h2>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
                  If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at:
                </p>
                <p className="text-sm sm:text-base">
                  <strong>Email:</strong> <a href="mailto:support@careerpilot.ai" className="text-blue-600 hover:text-blue-700">support@careerpilot.ai</a>
                </p>
              </CardContent>
            </Card>
          </div>
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

