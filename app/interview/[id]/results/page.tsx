'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'
import { TrendingUp, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function InterviewResultsPage() {
  const params = useParams()
  const sessionId = params.id as string

  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      fetchSession()
    }
  }, [sessionId])

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/interviews/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setSessionData(data)
      }
    } catch (error) {
      console.error('Failed to fetch session:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const score = sessionData?.readinessScore || 0
  const questions = sessionData?.questions || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Interview Readiness Results</h1>
              <p className="text-gray-600 mb-6">{sessionData?.jobTitle} • {sessionData?.industry}</p>
              
              <div className="inline-block">
                <div className="text-6xl font-bold text-primary mb-2">
                  {score}%
                </div>
                <p className="text-gray-600">Overall Readiness Score</p>
              </div>

              <div className="mt-8 w-full max-w-md mx-auto">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {sessionData?.strengths && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{sessionData.strengths}</p>
              </CardContent>
            </Card>
          )}

          {sessionData?.weaknesses && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{sessionData.weaknesses}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Question-by-Question Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questions.map((q: any, idx: number) => (
                  <div key={q.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold">Q{idx + 1}</span>
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {q.type}
                          </span>
                        </div>
                        <p className="font-medium">{q.question}</p>
                      </div>
                      {q.answer?.score !== null && (
                        <div className="ml-4">
                          <div className={`text-2xl font-bold ${
                            q.answer.score >= 70 ? 'text-green-600' : 
                            q.answer.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {q.answer.score}%
                          </div>
                        </div>
                      )}
                    </div>
                    {q.answer && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm text-gray-700">
                          <strong>Your Answer:</strong> {q.answer.answer}
                        </p>
                        {q.answer.feedback && (
                          <p className="text-sm text-gray-600">
                            <strong>Feedback:</strong> {q.answer.feedback}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex gap-4 justify-center">
            <Link href="/interview">
              <Button variant="outline">Back to Interviews</Button>
            </Link>
            <Link href="/interview/new">
              <Button>Start New Practice</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

