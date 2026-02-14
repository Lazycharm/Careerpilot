'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'
import { TrendingUp } from 'lucide-react'

interface Analytics {
  averageReadinessScore: number
  totalDownloads: number
  completedInterviews: number
  topIndustries: Array<{ industry: string; count: number }>
}

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

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
      fetchAnalytics()
    }
  }, [status, session, router])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
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
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          Analytics & Insights
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Average Interview Readiness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">
                {analytics?.averageReadinessScore || 0}%
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Across {analytics?.completedInterviews || 0} completed interviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">
                {analytics?.totalDownloads || 0}
              </div>
              <p className="text-sm text-gray-600 mt-2">Resumes and cover letters</p>
            </CardContent>
          </Card>

          {analytics?.topIndustries && analytics.topIndustries.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Top Industries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.topIndustries.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span>{item.industry}</span>
                      <span className="font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

