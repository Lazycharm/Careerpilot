'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, MessageSquare, Target, Download, TrendingUp, CheckCircle2 } from 'lucide-react'
import { Navbar } from '@/components/shared/Navbar'

interface DashboardStats {
  resumeCount: number
  resumeCompletion: number
  coverLetterCount: number
  interviewSessions: number
  interviewReadiness: number
  downloads: number
  subscriptionActive: boolean
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status, router])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resume Progress</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.resumeCompletion || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.resumeCount || 0} resume{stats?.resumeCount !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cover Letters</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.coverLetterCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">Generated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Interview Readiness</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.interviewReadiness || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.interviewSessions || 0} session{stats?.interviewSessions !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.downloads || 0}
              </div>
              <p className="text-xs text-muted-foreground">Total downloads</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/resume/new')}>
            <CardHeader className="pb-3">
              <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 mb-2" aria-label="Resume builder icon" />
              <CardTitle className="text-base sm:text-lg">Build ATS-Optimized Resume</CardTitle>
              <CardDescription className="text-sm">
                Create or edit your ATS-optimized resume for UAE jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full min-h-[44px]">Get Started</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/cover-letter/new')}>
            <CardHeader className="pb-3">
              <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600 mb-2" aria-label="Cover letter generator icon" />
              <CardTitle className="text-base sm:text-lg">Cover Letter Generator</CardTitle>
              <CardDescription className="text-sm">
                Generate AI-powered cover letters for UAE employers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full min-h-[44px]">Create Now</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1" onClick={() => router.push('/interview/new')}>
            <CardHeader className="pb-3">
              <Target className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 mb-2" aria-label="Interview preparation icon" />
              <CardTitle className="text-base sm:text-lg">Interview Prep UAE</CardTitle>
              <CardDescription className="text-sm">
                Practice and get readiness score for UAE job interviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full min-h-[44px]">Start Practice</Button>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Status */}
        {stats && (
          <Card className={stats.subscriptionActive ? 'border-green-500' : ''}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                Subscription Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.subscriptionActive ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  <span className="font-semibold text-sm sm:text-base">Active Subscription</span>
                  <span className="text-xs sm:text-sm text-gray-600">- Full access enabled</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm sm:text-base text-gray-600">
                    Upgrade to unlock all features and download your ATS-optimized resumes
                  </p>
                  <Link href="/subscription" className="block">
                    <Button className="w-full sm:w-auto min-h-[44px]">View Subscription Plans</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

