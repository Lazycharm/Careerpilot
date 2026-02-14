'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'
import { Target, Plus, TrendingUp, CheckCircle2, Clock } from 'lucide-react'

interface InterviewSession {
  id: string
  jobTitle: string
  industry: string
  status: string
  readinessScore: number | null
  createdAt: string
}

export default function InterviewListPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (status === 'authenticated') {
      fetchSessions()
    }
  }, [status, router])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/interviews')
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Failed to fetch interview sessions:', error)
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Interview Preparation</h1>
          <Link href="/interview/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Start New Session
            </Button>
          </Link>
        </div>

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No interview sessions yet</h3>
              <p className="text-gray-600 mb-4">Start practicing for your next interview</p>
              <Link href="/interview/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Practice
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {session.jobTitle}
                  </CardTitle>
                  <CardDescription>{session.industry}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      {session.status === 'completed' ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Completed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Clock className="h-4 w-4" />
                          In Progress
                        </span>
                      )}
                    </div>
                    {session.readinessScore !== null && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Readiness Score</span>
                          <span className="text-2xl font-bold text-primary">
                            {session.readinessScore}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${session.readinessScore}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <Link href={`/interview/${session.id}`}>
                      <Button className="w-full" variant={session.status === 'completed' ? 'outline' : 'default'}>
                        {session.status === 'completed' ? 'View Results' : 'Continue Practice'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

