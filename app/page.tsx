'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  CheckCircle2, FileText, Sparkles, Target,
  Shield, TrendingUp,
} from 'lucide-react'

// Landing sections
import { HeroSection } from '@/components/landing/HeroSection'
import { SocialProofBand } from '@/components/landing/SocialProofBand'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { TemplateShowcase } from '@/components/landing/TemplateShowcase'
import { AIFeatures } from '@/components/landing/AIFeatures'
import { Testimonials } from '@/components/landing/Testimonials'
import { ComparisonSection } from '@/components/landing/ComparisonSection'
import { FAQ } from '@/components/landing/FAQ'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/landing/ScrollReveal'

export default function LandingPage() {
  const [userCount, setUserCount] = useState(4200)

  useEffect(() => {
    fetch('/api/stats/public')
      .then((r) => r.json())
      .then((d) => { if (d.usersJoined) setUserCount(d.usersJoined) })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-white antialiased">

      {/* ── Navigation ────────────────────────────────────────────────── */}
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
                <Button size="sm" className="text-sm min-h-[44px] px-4 sm:px-5 gap-1.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 border-0">
                  <Sparkles className="h-3.5 w-3.5" />
                  Build My Resume
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── 1. HERO — attention + value prop ─────────────────────────── */}
      <HeroSection />

      {/* ── 2. SOCIAL PROOF BAND — authority ──────────────────────────── */}
      <SocialProofBand />

      {/* ── 3. PROBLEM → SOLUTION — pain recognition ──────────────────── */}
      <ProblemSection />

      {/* ── 4. TEMPLATE SHOWCASE — product demo ───────────────────────── */}
      <TemplateShowcase />

      {/* ── 5. HOW IT WORKS — process clarity ─────────────────────────── */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-10 sm:mb-14">
            <span className="inline-block rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700 mb-4">
              How it works
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-gray-900">
              Your job-winning resume in 3 steps
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              No writing skills. No hours of research. The AI handles the hard part.
            </p>
          </ScrollReveal>

          <StaggerContainer stagger={0.12} delay={0.1}>
            <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
              {[
                {
                  step: '01',
                  icon: FileText,
                  color: 'blue',
                  title: 'Pick your template',
                  desc: 'Choose from ATS-optimized templates designed for UAE recruiters. Every template guarantees 95%+ ATS pass rate.',
                },
                {
                  step: '02',
                  icon: Sparkles,
                  color: 'violet',
                  title: 'AI builds your content',
                  desc: 'Add your experience. AI generates keyword-optimized bullet points, a professional summary, and skills in seconds.',
                },
                {
                  step: '03',
                  icon: Target,
                  color: 'emerald',
                  title: 'Download & apply',
                  desc: 'Download your PDF, generate a matching cover letter, and practice interview questions — all from one dashboard.',
                },
              ].map(({ step, icon: Icon, color, title, desc }) => (
                <StaggerItem key={step}>
                  <div className="text-center group">
                    <div className={`relative w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm transition-shadow group-hover:shadow-md bg-${color}-50`}>
                      <Icon className={`w-8 h-8 text-${color}-600`} aria-hidden />
                      <span className={`absolute -top-2 -right-2 text-[10px] font-bold text-white bg-${color}-600 rounded-full w-5 h-5 flex items-center justify-center`}>
                        {step.replace('0', '')}
                      </span>
                    </div>
                    <h3 className="text-base font-bold mb-2 text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>

          <ScrollReveal delay={0.4} className="text-center mt-10">
            <Link href="/auth/register">
              <Button size="lg" className="min-h-[48px] px-8 gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 border-0">
                <Sparkles className="h-5 w-5" />
                Build My Resume Now
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 6. AI FEATURES — feature depth ────────────────────────────── */}
      <AIFeatures />

      {/* ── 7. TESTIMONIALS — social proof ─────────────────────────────── */}
      <Testimonials />

      {/* ── 8. COMPARISON — differentiation ───────────────────────────── */}
      <ComparisonSection />

      {/* ── 9. PRICING ─────────────────────────────────────────────────── */}
      <section id="pricing" className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-gray-900">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Build your resume today. Unlock downloads and all AI features when you&apos;re ready to apply.
            </p>
          </ScrollReveal>

          <div className="max-w-md mx-auto">
            <ScrollReveal>
              <Card className="border-2 border-primary shadow-xl shadow-blue-500/10 overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-blue-600 to-violet-600" />
                <CardContent className="p-6 sm:p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700 mb-3">
                      <Sparkles className="w-3 h-3" />
                      Most popular
                    </div>
                    <h3 className="text-2xl font-bold mb-1">Full Access</h3>
                    <p className="text-sm text-gray-500">Everything you need to land the job. Cancel anytime.</p>
                  </div>
                  <div className="space-y-3 mb-7">
                    {[
                      'Unlimited PDF resume downloads',
                      'AI-powered bullet point generation',
                      'AI cover letter generator',
                      'Interview prep with AI scoring',
                      'Resume tailoring to job postings',
                      'All professional templates',
                      'ATS optimization & scoring',
                      'Priority support',
                    ].map((feature) => (
                      <div key={feature} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/auth/register" className="block">
                    <Button size="lg" className="w-full min-h-[48px] bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 border-0">
                      Start Building Today
                    </Button>
                  </Link>
                  <p className="text-xs text-center text-gray-400 mt-3">
                    Build now · Download when you&apos;re ready · No commitment to start.
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── 10. FAQ ─────────────────────────────────────────────────────── */}
      <FAQ />

      {/* ── 11. FINAL CTA ───────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700 text-white py-16 sm:py-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-72 h-72 rounded-full bg-violet-300 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <ScrollReveal>
            <div className="max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 border border-white/30 px-3 py-1 text-xs font-semibold text-white mb-6">
                <TrendingUp className="w-3.5 h-3.5" />
                {userCount.toLocaleString()}+ professionals hired
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Your next career move starts here
              </h2>
              <p className="text-base sm:text-lg text-white/85 mb-8 leading-relaxed">
                Stop sending resumes into silence. Let AI build one that actually gets responses — in under 10 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/auth/register">
                  <Button size="lg" variant="secondary" className="text-base px-8 min-h-[52px] gap-2 w-full sm:w-auto font-semibold">
                    <Sparkles className="h-5 w-5" />
                    Build My Resume — Start Now
                  </Button>
                </Link>
                <Link href="/templates">
                  <Button size="lg" variant="outline" className="text-base px-8 min-h-[52px] w-full sm:w-auto border-white/40 text-white hover:bg-white/10 hover:text-white">
                    Browse Templates
                  </Button>
                </Link>
              </div>
              <p className="text-white/60 text-xs mt-4">No commitment to start · UAE market ready · Results guaranteed</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t bg-gray-50 py-10 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 sm:col-span-1">
              <h3 className="font-bold text-base mb-3">Career Pilot</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                AI-powered career platform for UAE job seekers. Build ATS-optimized resumes, cover letters, and ace your interviews.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm text-gray-900">Product</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                <li><Link href="/templates" className="hover:text-primary transition-colors">Resume Templates</Link></li>
                <li><Link href="/auth/register" className="hover:text-primary transition-colors">Resume Builder</Link></li>
                <li><Link href="/auth/register" className="hover:text-primary transition-colors">Cover Letter AI</Link></li>
                <li><Link href="/auth/register" className="hover:text-primary transition-colors">Interview Prep</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm text-gray-900">Company</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm text-gray-900">Support</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="/help/faqs" className="hover:text-primary transition-colors">FAQs</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
            <span>© {new Date().getFullYear()} Career Pilot by AxisMind. All rights reserved.</span>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              <span>Your data is encrypted and secure</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
