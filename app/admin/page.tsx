'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'
import { Users, Settings, TrendingUp, FileText, Target, MessageSquare, LayoutTemplate, DollarSign, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminStats {
  totalUsers: number
  totalResumes: number
  totalInterviews: number
  totalCoverLetters: number
  activeSubscriptions: number
  activeSubscriptionsByTier: { free: number; pay_per_download: number; pro: number; business: number }
  monthlyRevenue: number | null
  aiUsagePerUser: Array<{
    userId: string
    email: string
    name: string
    planType: string
    resumes: number
    coverLetters: number
    interviews: number
    limitResumes: number
    limitCoverLetters: number
    limitInterviews: number
    nearLimit: boolean
  }>
  usersCloseToLimit: AdminStats['aiUsagePerUser']
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [seedingTemplates, setSeedingTemplates] = useState(false)
  const [templateMessage, setTemplateMessage] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchStats()
    }
  }, [status, session, router])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOverridePlan = async (userId: string) => {
    const plan = window.prompt('Enter plan: free | pay_per_download | pro | business')
    if (!plan || !['free', 'pay_per_download', 'pro', 'business'].includes(plan)) return
    try {
      const res = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: plan }),
      })
      if (res.ok) fetchStats()
      else alert((await res.json()).error || 'Failed')
    } catch (e) {
      alert('Failed to update plan')
    }
  }

  const handleResetUsage = async (userId: string) => {
    if (!confirm('Reset AI usage for this user (current month)?')) return
    try {
      const res = await fetch(`/api/admin/users/${userId}/usage-reset`, { method: 'POST' })
      if (res.ok) fetchStats()
      else alert((await res.json()).error || 'Failed')
    } catch (e) {
      alert('Failed to reset usage')
    }
  }

  const handleSeedTemplates = async () => {
    if (!confirm('This will seed/update all resume templates. Continue?')) {
      return
    }
    
    setSeedingTemplates(true)
    setTemplateMessage(null)
    
    try {
      const response = await fetch('/api/resumes/seed-templates', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setTemplateMessage(`✅ ${data.message} - ${data.count} templates processed`)
      } else {
        setTemplateMessage(`❌ Error: ${data.error || 'Failed to seed templates'}`)
      }
    } catch (error) {
      console.error('Failed to seed templates:', error)
      setTemplateMessage('❌ Failed to seed templates. Please try again.')
    } finally {
      setSeedingTemplates(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalResumes || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Interview Sessions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalInterviews || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cover Letters</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCoverLetters || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div>
              {stats?.activeSubscriptionsByTier && (
                <p className="text-xs text-muted-foreground mt-1">
                  Pro: {stats.activeSubscriptionsByTier.pro} · Business: {stats.activeSubscriptionsByTier.business} · Pay-per: {stats.activeSubscriptionsByTier.pay_per_download}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.monthlyRevenue != null ? `$${stats.monthlyRevenue}` : '—'}</div>
              <p className="text-xs text-muted-foreground mt-1">From Stripe</p>
            </CardContent>
          </Card>
        </div>

        {stats?.usersCloseToLimit && stats.usersCloseToLimit.length > 0 && (
          <Card className="mb-8 border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-5 w-5" />
                Users Close to AI Limit
              </CardTitle>
              <CardDescription>Users at 80%+ of their monthly AI usage</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {stats.usersCloseToLimit.slice(0, 10).map((u) => (
                  <li key={u.userId} className="flex justify-between items-center">
                    <span>{u.email}</span>
                    <span className="text-muted-foreground">
                      {u.resumes}/{u.limitResumes} res · {u.coverLetters}/{u.limitCoverLetters} cl · {u.interviews}/{u.limitInterviews} int
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>AI Usage by User (this month)</CardTitle>
            <CardDescription>Resumes, cover letters, and interview sessions generated. Manual override and reset below.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">User</th>
                    <th className="text-left py-2">Plan</th>
                    <th className="text-right py-2">Resumes</th>
                    <th className="text-right py-2">Cover Letters</th>
                    <th className="text-right py-2">Interviews</th>
                    <th className="text-right py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.aiUsagePerUser?.slice(0, 50).map((u) => (
                    <tr key={u.userId} className="border-b border-gray-100">
                      <td className="py-2">{u.email}</td>
                      <td className="py-2">{u.planType}</td>
                      <td className="text-right py-2">{u.resumes} / {u.limitResumes}</td>
                      <td className="text-right py-2">{u.coverLetters} / {u.limitCoverLetters}</td>
                      <td className="text-right py-2">{u.interviews} / {u.limitInterviews}</td>
                      <td className="py-2 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="mr-1"
                          onClick={() => handleOverridePlan(u.userId)}
                        >
                          Plan
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetUsage(u.userId)}
                        >
                          Reset
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/users">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage users and their accounts</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/settings">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <Settings className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure features, pricing, and toggles</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/analytics">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>Analytics</CardTitle>
                <CardDescription>View platform analytics and insights</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Template Management */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5" />
              Resume Templates
            </CardTitle>
            <CardDescription>
              Manage and seed resume templates for the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleSeedTemplates}
                disabled={seedingTemplates}
                className="min-w-[200px]"
              >
                {seedingTemplates ? 'Seeding...' : 'Seed Templates'}
              </Button>
              {templateMessage && (
                <p className={`text-sm ${templateMessage.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                  {templateMessage}
                </p>
              )}
            </div>
            <p className="text-sm text-gray-600">
              This will create or update 6 professional resume templates: Modern Professional, Classic Traditional, Creative Design, Timeline, Minimalist, and Executive.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

