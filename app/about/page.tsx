import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata = genMeta({
  title: 'About Career Pilot - AI-Powered Career Platform by Axix Minds',
  description: 'Learn about Career Pilot, an AI-powered career preparation platform designed for UAE job seekers. Built by Axix Minds to help people create job-ready resumes and ace interviews.',
  keywords: ['about Career Pilot', 'Axix Minds', 'UAE career platform', 'resume builder company', 'career preparation platform'],
  canonical: '/about',
})

export default function AboutPage() {
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
              About CareerPilot
            </h1>
          </div>

          {/* About CareerPilot */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-6 sm:p-8">
              <div className="prose prose-sm sm:prose-base max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                  CareerPilot is an AI-powered career preparation platform designed to help people build job-ready resumes, prepare for interviews, and confidently pursue opportunities in the UAE and beyond.
                </p>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  CareerPilot is a product of Asix Minds, a technology company focused on building practical digital solutions that simplify life, unlock opportunities, and empower communities across regions.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Who We Are */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Who We Are</h2>
              <div className="prose prose-sm sm:prose-base max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base">
                  Axis Minds is a forward thinking technology company creating tools that solve real world problems.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base">
                  Our mission is simple: build smart, accessible solutions that help people move forward professionally, financially, and socially.
                </p>
                <p className="text-gray-700 leading-relaxed font-semibold text-sm sm:text-base">
                  We don&apos;t build technology for hype.<br />
                  We build it to work.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Why We Built CareerPilot */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Why We Built CareerPilot</h2>
              <div className="prose prose-sm sm:prose-base max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base">
                  Finding the right job shouldn&apos;t feel overwhelming.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base">
                  Many talented people struggle not because they lack skills, but because they lack proper resumes, interview preparation, access to modern tools, and guidance tailored to their job market.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base">
                  CareerPilot was created to bridge that gap.
                </p>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  Using AI, professional templates, and structured interview preparation, we help users create ATS-optimized resumes, build job-specific cover letters, prepare for real interview questions, and measure their readiness before applying.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Built for the UAE */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Built for the UAE, Designed for the World</h2>
              <div className="prose prose-sm sm:prose-base max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base">
                  CareerPilot is carefully tailored for the UAE job market, with ATS-friendly CV formats, UAE appropriate resume standards, and job-specific interview preparation.
                </p>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  As Axis Minds grows, our solutions will expand across the UAE, Gulf countries, and international markets.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4 text-sm sm:text-base">
                  Our goal is to make CareerPilot a global career companion, starting from the UAE.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* More Than One Product */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">More Than One Product</h2>
              <div className="prose prose-sm sm:prose-base max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base">
                  CareerPilot is part of a growing ecosystem of solutions developed by Axis Minds.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base">
                  One of our notable platforms is CashLink a service created to support Africans living in the UAE by making access to financial and community services easier.
                </p>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  As we continue to grow and gain recognition, Axis Minds will keep building tools that solve real problems, support underserved communities, and create meaningful impact.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Our Vision */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Our Vision</h2>
              <p className="text-gray-700 leading-relaxed text-lg sm:text-xl font-medium text-sm sm:text-base">
                To build a world where opportunities are accessible, technology works for people, and skills and talent are not limited by location.
              </p>
            </CardContent>
          </Card>

          {/* Our Commitment */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Our Commitment</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                We are committed to continuous improvement, ethical use of AI, data privacy, security, and building products people can trust.
              </p>
            </CardContent>
          </Card>

          {/* Join the Journey */}
          <Card className="mb-8 sm:mb-12">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Join the Journey</h2>
              <div className="prose prose-sm sm:prose-base max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6 text-sm sm:text-base">
                  CareerPilot is still growing  and this is only the beginning.
                </p>
                <p className="text-gray-700 leading-relaxed mb-6 text-sm sm:text-base">
                  Whether you&apos;re a job seeker, a professional, or a partner, we&apos;re excited to build the future together.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/auth/register">
                    <Button size="lg" className="w-full sm:w-auto min-h-[48px]">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto min-h-[48px]">
                      View Our Products
                    </Button>
                  </Link>
                </div>
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

