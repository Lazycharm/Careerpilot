'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, FileText, MessageSquare, Target, Zap, Shield, TrendingUp, Upload, Sparkles, BarChart3 } from 'lucide-react'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'
import { TemplateShowcase } from '@/components/landing/TemplateShowcase'
import { Testimonials } from '@/components/landing/Testimonials'
import { FAQ } from '@/components/landing/FAQ'

export default function LandingPage() {
  const [stats, setStats] = useState({
    jobsLanded: 1250,
    resumesBuilt: 3500,
    usersJoined: 2800,
  })

  useEffect(() => {
    fetch('/api/stats/public')
      .then(res => res.json())
      .then(data => {
        setStats({
          jobsLanded: data.jobsLanded || 1250,
          resumesBuilt: data.resumesBuilt || 3500,
          usersJoined: data.usersJoined || 2800,
        })
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-white">
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
            <div className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
              <Link href="/templates" className="hover:text-primary transition-colors">Templates</Link>
              <Link href="#how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
              <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-sm min-h-[44px] px-3 sm:px-4">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="text-sm min-h-[44px] px-4 sm:px-5">
                  Create My Resume
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 md:pt-20 pb-8 sm:pb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight tracking-tight text-gray-900">
            Land your dream job with a resume that{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              gets interviews
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Only 2% of resumes make it past ATS filters. Build yours with AI-powered optimization,
            professional templates, and interview prep — all in one platform built for UAE job seekers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button size="lg" className="text-base sm:text-lg px-8 w-full sm:w-auto min-h-[52px] gap-2">
                <Sparkles className="h-5 w-5" />
                Create My Resume
              </Button>
            </Link>
            <Link href="/auth/register?upload=true" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="text-base sm:text-lg px-8 w-full sm:w-auto min-h-[52px] gap-2">
                <Upload className="h-5 w-5" />
                Upload Existing Resume
              </Button>
            </Link>
          </div>
          <p className="text-xs text-gray-500">
            Free to start. No credit card required.
          </p>
        </div>

        {/* Trust bar */}
        <div className="mt-10 sm:mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              <AnimatedCounter end={stats.resumesBuilt} suffix="+" />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Resumes built</p>
          </div>
          <div className="h-8 w-px bg-gray-200 hidden sm:block" />
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              <AnimatedCounter end={stats.jobsLanded} suffix="+" />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Jobs landed</p>
          </div>
          <div className="h-8 w-px bg-gray-200 hidden sm:block" />
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600">90%</div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">ATS pass rate</p>
          </div>
        </div>
      </section>

      {/* Template Showcase */}
      <TemplateShowcase />

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            Your job-winning resume in 3 steps
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            No writing skills needed. Our AI handles the hard part.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-blue-600" aria-hidden="true" />
            </div>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Step 1</div>
            <h3 className="text-lg font-semibold mb-2">Pick a template</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Choose from 16 ATS-optimized templates designed by hiring experts. Every one passes recruiter screening.
            </p>
          </div>

          <div className="text-center">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-purple-600" aria-hidden="true" />
            </div>
            <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">Step 2</div>
            <h3 className="text-lg font-semibold mb-2">Fill in your details, AI does the rest</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Add your experience and skills. Our AI generates polished bullet points, summaries, and keyword optimization.
            </p>
          </div>

          <div className="text-center">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-7 h-7 text-green-600" aria-hidden="true" />
            </div>
            <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Step 3</div>
            <h3 className="text-lg font-semibold mb-2">Download and start applying</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Download as PDF, generate a matching cover letter, and practice interview questions — all in one place.
            </p>
          </div>
        </div>
        <div className="text-center mt-10">
          <Link href="/auth/register">
            <Button size="lg" className="min-h-[48px] px-8 gap-2">
              Create My Resume Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
              Everything you need to get hired
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              One platform for your entire job application — from resume to interview.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 sm:p-6">
                <Sparkles className="w-8 h-8 text-blue-600 mb-3" aria-hidden="true" />
                <h3 className="font-semibold mb-1.5">AI Resume Writer</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Generate keyword-optimized bullet points and summaries tailored to your target role.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 sm:p-6">
                <Zap className="w-8 h-8 text-yellow-600 mb-3" aria-hidden="true" />
                <h3 className="font-semibold mb-1.5">ATS Optimization</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Every template passes ATS filters. Your resume gets seen by real recruiters, not just bots.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 sm:p-6">
                <MessageSquare className="w-8 h-8 text-purple-600 mb-3" aria-hidden="true" />
                <h3 className="font-semibold mb-1.5">Cover Letter Generator</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Generate a tailored cover letter that matches your resume in seconds. Not generic — specific to your role.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 sm:p-6">
                <Target className="w-8 h-8 text-green-600 mb-3" aria-hidden="true" />
                <h3 className="font-semibold mb-1.5">Interview Prep & Scoring</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Practice with AI-generated interview questions and get a readiness score before the real thing.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 sm:p-6">
                <BarChart3 className="w-8 h-8 text-indigo-600 mb-3" aria-hidden="true" />
                <h3 className="font-semibold mb-1.5">Resume Tailoring</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Paste a job posting and our AI adjusts your resume to match the role&apos;s requirements.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 sm:p-6">
                <Shield className="w-8 h-8 text-teal-600 mb-3" aria-hidden="true" />
                <h3 className="font-semibold mb-1.5">Built for the UAE</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Understands Dubai, Abu Dhabi, and GCC hiring standards. Formats and keywords that UAE employers expect.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Start free. Upgrade when you&apos;re ready to download and unlock AI features.
            </p>
          </div>
          <div className="max-w-lg mx-auto">
            <Card className="border-2 border-primary shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-1">Premium Access</h3>
                  <p className="text-sm text-gray-600">
                    Unlock everything. Cancel anytime.
                  </p>
                </div>
                <div className="space-y-3 mb-6">
                  {[
                    'Unlimited resume downloads (PDF)',
                    'AI-powered content generation',
                    'Cover letter generator',
                    'Interview prep with scoring',
                    'Resume tailoring to job posts',
                    'All 16 professional templates',
                    'Priority support',
                  ].map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href="/auth/register" className="block">
                  <Button size="lg" className="w-full min-h-[48px]">
                    Get Started Free
                  </Button>
                </Link>
                <p className="text-xs text-center text-gray-500 mt-3">
                  Free to create. Pay only when you download.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* Bottom CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Your next career move starts here
          </h2>
          <p className="text-base sm:text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join {stats.usersJoined.toLocaleString()}+ professionals who built their resume with Career Pilot and landed jobs across the UAE.
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="text-base sm:text-lg px-8 min-h-[52px]">
              Build My Resume Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-10 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 sm:col-span-1">
              <h3 className="font-bold text-base mb-3">Career Pilot</h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                AI-powered career platform for UAE job seekers. Build ATS-optimized resumes, cover letters, and ace your interviews.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Product</h4>
              <ul className="space-y-2 text-xs text-gray-600">
                <li><Link href="/templates" className="hover:text-primary transition-colors">Resume Templates</Link></li>
                <li><Link href="/auth/register" className="hover:text-primary transition-colors">Resume Builder</Link></li>
                <li><Link href="/auth/register" className="hover:text-primary transition-colors">Cover Letter Generator</Link></li>
                <li><Link href="/auth/register" className="hover:text-primary transition-colors">Interview Prep</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-xs text-gray-600">
                <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Support</h4>
              <ul className="space-y-2 text-xs text-gray-600">
                <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="/help/faqs" className="hover:text-primary transition-colors">FAQs</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Career Pilot by AxisMind. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
