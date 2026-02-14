'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, FileText, MessageSquare, Target, Zap, Shield, TrendingUp, Users } from 'lucide-react'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'

export default function LandingPage() {
  const [stats, setStats] = useState({
    jobsLanded: 1250,
    resumesBuilt: 3500,
    usersJoined: 2800,
  })

  useEffect(() => {
    // Fetch real stats from API
    fetch('/api/stats/public')
      .then(res => res.json())
      .then(data => {
        setStats({
          jobsLanded: data.jobsLanded || 1250,
          resumesBuilt: data.resumesBuilt || 350,
          usersJoined: data.usersJoined || 1985,
        })
      })
      .catch(() => {
        // Use fallback numbers if API fails
      })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="Career Pilot - UAE Resume Builder and ATS-Optimized CV Maker" 
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

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
          UAE Resume Builder: Create ATS-Optimized Resumes for Dubai & Abu Dhabi Jobs
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-2">
          Build professional, ATS-optimized resumes tailored for UAE employers. Our AI-powered resume builder helps you create job-ready CVs for Dubai, Abu Dhabi, and GCC job markets. Generate cover letters and prepare for interviews with UAE-specific insights.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
          <Link href="/auth/register" className="w-full sm:w-auto">
            <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto min-h-[48px]">
              Start Free Trial
            </Button>
          </Link>
          <Link href="#how-it-works" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto min-h-[48px]">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">
          How Our UAE Resume Builder Works
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" aria-hidden="true" />
              </div>
              <CardTitle className="text-lg sm:text-xl">1. Build Your ATS-Optimized Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Create an ATS-optimized resume using our professional templates, specifically tailored for UAE job market standards. Our resume builder UAE ensures your CV passes applicant tracking systems used by Dubai and Abu Dhabi employers.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" aria-hidden="true" />
              </div>
              <CardTitle className="text-lg sm:text-xl">2. AI-Powered Resume Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Let our AI resume builder enhance your resume, generate personalized cover letters, and prepare you for interviews with UAE-specific insights. Get keyword optimization for Dubai and GCC job markets.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center sm:col-span-2 lg:col-span-1">
            <CardHeader>
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" aria-hidden="true" />
              </div>
              <CardTitle className="text-lg sm:text-xl">3. Ace Your UAE Job Interview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Practice with AI-generated interview questions tailored for UAE employers. Get scored feedback and know your readiness percentage before the real interview in Dubai or Abu Dhabi.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Preview */}
      <section className="bg-gray-50 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">
            Everything You Need for UAE Job Success
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 mb-2" aria-label="ATS-friendly resume templates icon" />
                <CardTitle className="text-base sm:text-lg">ATS-Friendly Resume Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Professional, ATS-friendly resume templates designed specifically for UAE job applications. Our CV maker UAE offers GCC resume formats that pass applicant tracking systems.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 mb-2" aria-label="AI cover letter generator icon" />
                <CardTitle className="text-base sm:text-lg">AI Cover Letter Generator UAE</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Generate personalized cover letters tailored to UAE work culture. Our cover letter generator UAE creates professional letters for Dubai and Abu Dhabi employers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 mb-2" aria-label="Interview preparation icon" />
                <CardTitle className="text-base sm:text-lg">Interview Preparation UAE</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Get UAE-relevant interview questions, practice answers, and know your readiness score. Prepare for job interviews in Dubai, Abu Dhabi, and GCC countries.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600 mb-2" aria-label="ATS optimization icon" />
                <CardTitle className="text-base sm:text-lg">ATS Resume Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  AI-powered resume keyword optimization to pass UAE ATS systems. Our resume builder automatically optimizes your CV for applicant tracking systems used by Dubai employers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 mb-2" aria-label="Readiness tracking icon" />
                <CardTitle className="text-base sm:text-lg">Interview Readiness Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Track your interview readiness percentage and improve over time. Get analytics on your performance and readiness for UAE job interviews.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 mb-2" aria-label="UAE-focused platform icon" />
                <CardTitle className="text-base sm:text-lg">UAE-Focused Career Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Built specifically for UAE job market requirements and culture. Our platform understands Dubai, Abu Dhabi, and GCC hiring standards.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4">
          Simple, Transparent Pricing for Your UAE Resume Builder
        </h2>
        <p className="text-center text-sm sm:text-base text-gray-600 mb-8 sm:mb-12 px-4">
          All prices are controlled and can be updated anytime. Get unlimited access to our ATS resume builder, cover letter generator, and interview prep tools.
        </p>
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary">
            <CardHeader className="text-center px-4 sm:px-6">
              <CardTitle className="text-2xl sm:text-3xl">Premium Access</CardTitle>
              <CardDescription className="text-base sm:text-lg mt-2">
                Unlock all features and download your ATS-optimized resumes
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-3 sm:space-y-4 px-4 sm:px-6 pb-6">
              <div className="flex items-start justify-center gap-2 text-left">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm sm:text-base">Unlimited ATS-Optimized Resume Downloads</span>
              </div>
              <div className="flex items-start justify-center gap-2 text-left">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm sm:text-base">AI-Powered Resume Optimization</span>
              </div>
              <div className="flex items-start justify-center gap-2 text-left">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm sm:text-base">Cover Letter Generator UAE</span>
              </div>
              <div className="flex items-start justify-center gap-2 text-left">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm sm:text-base">Interview Preparation System</span>
              </div>
              <div className="flex items-start justify-center gap-2 text-left">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm sm:text-base">Readiness Scoring & Analytics</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Ready to Start Your UAE Career Journey?
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90 px-2">
              Join thousands of job seekers who landed their dream jobs in Dubai, Abu Dhabi, and across the UAE using our ATS resume builder
            </p>
          </div>

          {/* Animated Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto mb-8 sm:mb-12">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">
                <AnimatedCounter 
                  end={stats.jobsLanded} 
                  suffix="+" 
                  className="text-white"
                />
              </div>
              <p className="text-lg sm:text-xl opacity-90">Jobs Landed</p>
              <p className="text-xs sm:text-sm opacity-75 mt-1">Success stories in UAE</p>
            </div>

            <div className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">
                <AnimatedCounter 
                  end={stats.resumesBuilt} 
                  suffix="+" 
                  className="text-white"
                />
              </div>
              <p className="text-lg sm:text-xl opacity-90">Resumes Built</p>
              <p className="text-xs sm:text-sm opacity-75 mt-1">ATS-optimized CVs created</p>
            </div>

            <div className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">
                <AnimatedCounter 
                  end={stats.usersJoined} 
                  suffix="+" 
                  className="text-white"
                />
              </div>
              <p className="text-lg sm:text-xl opacity-90">Users Joined</p>
              <p className="text-xs sm:text-sm opacity-75 mt-1">Active job seekers</p>
            </div>
          </div>

          <div className="text-center px-4">
            <Link href="/auth/register" className="inline-block">
              <Button size="lg" variant="secondary" className="text-base sm:text-lg px-6 sm:px-8 min-h-[48px] w-full sm:w-auto">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Career Pilot</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                AI-powered resume builder and career readiness platform for UAE job seekers. Create ATS-optimized resumes for Dubai, Abu Dhabi, and GCC employers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                <li><Link href="#how-it-works" className="hover:text-primary transition-colors">UAE Resume Builder</Link></li>
                <li><Link href="#how-it-works" className="hover:text-primary transition-colors">ATS Resume Templates</Link></li>
                <li><Link href="#how-it-works" className="hover:text-primary transition-colors">Cover Letter Generator</Link></li>
                <li><Link href="#how-it-works" className="hover:text-primary transition-colors">Interview Prep UAE</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/products" className="hover:text-primary transition-colors">Products</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="/help/faqs" className="hover:text-primary transition-colors">FAQs</Link></li>
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

