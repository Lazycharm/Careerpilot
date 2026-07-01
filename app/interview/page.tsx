'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'
import { Target, Plus, CheckCircle2, Clock, TrendingUp, Trash2 } from 'lucide-react'

interface InterviewSession {
  id: string
  jobTitle: string
  industry: string
  status: string
  readinessScore: number | null
  createdAt: string
  updatedAt: string
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function InterviewListPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (status === 'authenticated') fetchSessions()
  }, [status, router])

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/interviews')
      if (res.ok) setSessions(await res.json())
    } catch (e) {
      console.error('Failed to fetch interview sessions', e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this interview session? This cannot be undone.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/interviews/${id}`, { method: 'DELETE' })
      if (res.ok) setSessions((prev) => prev.filter((s) => s.id !== id))
    } catch (e) {
      console.error('Failed to delete session', e)
    } finally {
      setDeleting(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Interview Preparation</h1>
            {sessions.length > 0 && (
              <p className="text-sm text-gray-500 mt-0.5">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          <Link href="/interview/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto min-h-[44px] gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 border-0">
              <Plus className="h-4 w-4" />
              Start New Session
            </Button>
          </Link>
        </div>

        {sessions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <Target className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">No interview sessions yet</h3>
              <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">
                Practice with AI-generated questions tailored to your role — get scored and improve with every session
              </p>
              <Link href="/interview/new">
                <Button className="min-h-[44px] gap-2">
                  <Plus className="h-4 w-4" />
                  Start My First Practice
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {sessions.map((s) => (
              <Card key={s.id} className="hover:shadow-md transition-shadow group">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Target className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm sm:text-base font-semibold truncate">
                        {s.jobTitle}
                      </CardTitle>
                      <CardDescription className="text-xs">{s.industry}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {s.readinessScore !== null && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Readiness
                        </span>
                        <span className={`text-sm font-bold ${
                          s.readinessScore >= 75 ? 'text-green-600'
                          : s.readinessScore >= 50 ? 'text-yellow-600'
                          : 'text-red-600'
                        }`}>
                          {s.readinessScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            s.readinessScore >= 75 ? 'bg-green-500'
                            : s.readinessScore >= 50 ? 'bg-yellow-500'
                            : 'bg-red-500'
                          }`}
                          style={{ width: `${s.readinessScore}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeAgo(s.updatedAt || s.createdAt)}
                    </span>
                    <div className="flex gap-1.5">
                      <Link href={s.status === 'completed' ? `/interview/${s.id}/results` : `/interview/${s.id}`}>
                        <Button variant="outline" size="sm" className="h-8 px-2.5 gap-1 text-xs">
                          {s.status === 'completed' ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                              Results
                            </>
                          ) : (
                            <>
                              <Target className="h-3.5 w-3.5" />
                              Continue
                            </>
                          )}
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-red-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(s.id)}
                        disabled={deleting === s.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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
