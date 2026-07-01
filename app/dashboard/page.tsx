'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FileText,
  MessageSquare,
  Target,
  Download,
  TrendingUp,
  CheckCircle2,
  Plus,
  Clock,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Brain,
} from 'lucide-react'
import { Navbar } from '@/components/shared/Navbar'

interface RecentResume {
  id: string
  title: string
  templateId: string
  updatedAt: string
  status: string
}
interface RecentCoverLetter {
  id: string
  jobTitle: string
  industry: string
  updatedAt: string
}
interface RecentInterview {
  id: string
  jobTitle: string
  industry: string
  status: string
  readinessScore: number | null
  updatedAt: string
}
interface DashboardStats {
  resumeCount: number
  resumeCompletion: number
  coverLetterCount: number
  interviewSessions: number
  interviewReadiness: number
  downloads: number
  subscriptionActive: boolean
  recentResumes: RecentResume[]
  recentCoverLetters: RecentCoverLetter[]
  recentInterviews: RecentInterview[]
  aiUsage: { resumeGenerated: number; coverLetterGenerated: number; interviewGenerated: number }
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = 'blue',
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color?: 'blue' | 'violet' | 'green' | 'orange'
}) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    violet: 'text-violet-600 bg-violet-50',
    green: 'text-green-600 bg-green-50',
    orange: 'text-orange-600 bg-orange-50',
  }
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          </div>
          <div className={`rounded-lg p-2 ${colors[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (status === 'authenticated') fetchStats()
  }, [status, router])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats')
      if (!res.ok) throw new Error()
      setStats(await res.json())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
          <p className="text-sm text-gray-500">Loading your dashboard…</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const firstName = session.user?.name?.split(' ')[0] || 'there'
  const isNewUser = stats?.resumeCount === 0 && stats?.coverLetterCount === 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">

        {/* Error banner */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            Failed to load stats. Your documents are still safe.
          </div>
        )}

        {/* Welcome header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isNewUser
              ? 'Let\'s build something great — create your first resume to get started.'
              : 'Pick up where you left off.'}
          </p>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <StatCard
              label="Resume Completion"
              value={`${stats.resumeCompletion}%`}
              sub={`${stats.resumeCount} resume${stats.resumeCount !== 1 ? 's' : ''}`}
              icon={FileText}
              color="blue"
            />
            <StatCard
              label="Cover Letters"
              value={stats.coverLetterCount}
              sub="Generated"
              icon={MessageSquare}
              color="violet"
            />
            <StatCard
              label="Interview Readiness"
              value={`${stats.interviewReadiness}%`}
              sub={`${stats.interviewSessions} session${stats.interviewSessions !== 1 ? 's' : ''}`}
              icon={Target}
              color="green"
            />
            <StatCard
              label="Total Downloads"
              value={stats.downloads}
              sub="PDF exports"
              icon={Download}
              color="orange"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* New User Onboarding */}
            {isNewUser && (
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    Start building your career toolkit
                  </CardTitle>
                  <CardDescription>
                    Most users land interviews after completing these 3 steps
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { step: 1, label: 'Build your resume', href: '/resume/new', icon: FileText },
                    { step: 2, label: 'Write a cover letter', href: '/cover-letter/new', icon: MessageSquare },
                    { step: 3, label: 'Practice interview questions', href: '/interview/new', icon: Target },
                  ].map(({ step, label, href, icon: Icon }) => (
                    <Link key={step} href={href}>
                      <div className="flex items-center gap-3 rounded-lg bg-white border border-blue-100 px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {step}
                        </div>
                        <Icon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-800">{label}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recent Resumes */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    My Resumes
                  </CardTitle>
                  {stats?.resumeCount ? (
                    <p className="text-xs text-gray-400 mt-0.5">{stats.resumeCount} total</p>
                  ) : null}
                </div>
                <Link href="/resume/new">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    <Plus className="h-3.5 w-3.5" />
                    New
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {stats?.recentResumes && stats.recentResumes.length > 0 ? (
                  <div className="space-y-2">
                    {stats.recentResumes.map((r) => (
                      <Link key={r.id} href={`/resume/${r.id}`}>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2.5 hover:border-blue-200 hover:bg-blue-50/40 transition-all group">
                          <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                            <p className="text-xs text-gray-400 capitalize">{r.status === 'completed' ? 'Complete' : 'Draft'}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {timeAgo(r.updatedAt)}
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                          </div>
                        </div>
                      </Link>
                    ))}
                    {stats.resumeCount > 4 && (
                      <Link href="/resume" className="block">
                        <p className="text-xs text-center text-blue-600 hover:underline pt-1">
                          View all {stats.resumeCount} resumes
                        </p>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-3">No resumes yet</p>
                    <Link href="/resume/new">
                      <Button size="sm" className="gap-1.5">
                        <Plus className="h-3.5 w-3.5" />
                        Build My Resume
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Cover Letters */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-violet-600" />
                  Cover Letters
                </CardTitle>
                <Link href="/cover-letter/new">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    <Plus className="h-3.5 w-3.5" />
                    New
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {stats?.recentCoverLetters && stats.recentCoverLetters.length > 0 ? (
                  <div className="space-y-2">
                    {stats.recentCoverLetters.map((cl) => (
                      <Link key={cl.id} href={`/cover-letter/${cl.id}`}>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2.5 hover:border-violet-200 hover:bg-violet-50/40 transition-all group">
                          <div className="w-8 h-8 rounded-md bg-violet-100 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="h-4 w-4 text-violet-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{cl.jobTitle}</p>
                            <p className="text-xs text-gray-400">{cl.industry}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {timeAgo(cl.updatedAt)}
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-violet-500 transition-colors" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-3">No cover letters yet</p>
                    <Link href="/cover-letter/new">
                      <Button size="sm" variant="outline" className="gap-1.5">
                        <Plus className="h-3.5 w-3.5" />
                        Write My Cover Letter
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Right column — sidebar */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Start</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {[
                  { label: 'New Resume', href: '/resume/new', icon: FileText, color: 'text-blue-600' },
                  { label: 'New Cover Letter', href: '/cover-letter/new', icon: MessageSquare, color: 'text-violet-600' },
                  { label: 'Practice Interview', href: '/interview/new', icon: Target, color: 'text-green-600' },
                ].map(({ label, href, icon: Icon, color }) => (
                  <Link key={href} href={href}>
                    <div className={`flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200`}>
                      <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                      <ChevronRight className="h-4 w-4 text-gray-300 ml-auto" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Recent Interviews */}
            {stats?.recentInterviews && stats.recentInterviews.length > 0 && (
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-4 w-4 text-green-600" />
                    Interview Sessions
                  </CardTitle>
                  <Link href="/interview/new">
                    <Button size="sm" variant="ghost" className="text-xs h-7 px-2">New</Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {stats.recentInterviews.map((s) => (
                    <Link key={s.id} href={`/interview/${s.id}`}>
                      <div className="flex items-start gap-2 rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">{s.jobTitle}</p>
                          <p className="text-[11px] text-gray-400">{s.industry}</p>
                        </div>
                        {s.readinessScore != null ? (
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                            s.readinessScore >= 75 ? 'bg-green-100 text-green-700'
                            : s.readinessScore >= 50 ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                          }`}>
                            {s.readinessScore}%
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400 capitalize">{s.status}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* AI Usage */}
            {stats?.aiUsage && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    AI Usage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {[
                    { label: 'Resume assists', value: stats.aiUsage.resumeGenerated },
                    { label: 'Cover letter assists', value: stats.aiUsage.coverLetterGenerated },
                    { label: 'Interview sessions', value: stats.aiUsage.interviewGenerated },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 text-xs">{label}</span>
                      <span className="font-semibold text-gray-800">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Subscription Status */}
            {stats && (
              <Card className={stats.subscriptionActive ? 'border-green-200 bg-green-50/50' : ''}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {stats.subscriptionActive ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm font-semibold">Active — Full Access</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-600">
                        Upgrade to download ATS-optimized PDFs and unlock all AI features
                      </p>
                      <Link href="/subscription">
                        <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 border-0">
                          Unlock Full Access
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
