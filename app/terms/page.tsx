import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata = genMeta({
  title: 'Terms of Service - Career Pilot User Agreement',
  description: 'Read Career Pilot terms of service to understand the rules and guidelines for using our AI-powered resume builder and career preparation platform.',
  keywords: ['terms of service', 'user agreement', 'Career Pilot terms', 'terms and conditions'],
  canonical: '/terms',
})

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6 sm:space-y-8">
            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  By accessing or using Career Pilot, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">2. Use License</h2>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
                  Permission is granted to temporarily use Career Pilot for personal, non-commercial use. This license does not include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm sm:text-base ml-4">
                  <li>Modifying or copying the materials</li>
                  <li>Using the materials for any commercial purpose</li>
                  <li>Attempting to reverse engineer any software</li>
                  <li>Removing any copyright or proprietary notations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">3. User Accounts</h2>
                <div className="space-y-4 text-sm sm:text-base">
                  <p className="text-gray-700 leading-relaxed">
                    To use certain features of Career Pilot, you must create an account. You agree to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Accept responsibility for all activities under your account</li>
                    <li>Notify us immediately of any unauthorized use</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">4. User Content</h2>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
                  You retain ownership of all content you create using Career Pilot, including resumes and cover letters. By using our platform, you grant us a license to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm sm:text-base ml-4">
                  <li>Store and process your content to provide our services</li>
                  <li>Use AI to analyze and optimize your content</li>
                  <li>Generate suggestions and improvements</li>
                </ul>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed mt-4">
                  You are responsible for ensuring your content does not violate any laws or infringe on any third-party rights.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">5. Payment and Subscriptions</h2>
                <div className="space-y-4 text-sm sm:text-base">
                  <p className="text-gray-700 leading-relaxed">
                    Certain features require a paid subscription. By purchasing a subscription, you agree to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Pay all fees associated with your subscription</li>
                    <li>Automatic renewal unless cancelled</li>
                    <li>No refunds except as required by law or at our discretion</li>
                    <li>Price changes with reasonable notice</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">6. Prohibited Uses</h2>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
                  You may not use Career Pilot to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm sm:text-base ml-4">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit harmful or malicious code</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the platform</li>
                  <li>Create false or misleading information</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">7. Disclaimer</h2>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  Career Pilot is provided "as is" without warranties of any kind. We do not guarantee that our services will be uninterrupted, error-free, or meet your specific requirements. We are not responsible for the accuracy of AI-generated content or job application outcomes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">8. Limitation of Liability</h2>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  In no event shall Career Pilot or its providers be liable for any damages arising out of the use or inability to use our services, including but not limited to direct, indirect, incidental, or consequential damages.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">9. Changes to Terms</h2>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  We reserve the right to modify these terms at any time. Continued use of Career Pilot after changes constitutes acceptance of the new terms. We will notify users of significant changes via email or platform notification.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">10. Contact Information</h2>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
                  If you have questions about these Terms of Service, please contact us at:
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

