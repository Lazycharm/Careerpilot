'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'
import { Target, TrendingUp, CheckCircle2 } from 'lucide-react'

interface Question {
  id: string
  question: string
  type: string
  answer?: {
    answer: string
    score: number | null
    feedback: string | null
  }
}

export default function InterviewSessionPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string

  const [sessionData, setSessionData] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
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
        setQuestions(data.questions || [])
      }
    } catch (error) {
      console.error('Failed to fetch interview session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!confirm('Complete this interview session? You will receive your readiness score.')) return

    try {
      const response = await fetch(`/api/interviews/${sessionId}/complete`, {
        method: 'POST',
      })

      if (response.ok) {
        router.push(`/interview/${sessionId}/results`)
      }
    } catch (error) {
      console.error('Failed to complete session:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const answeredCount = questions.filter(q => q.answer).length
  const allAnswered = answeredCount === questions.length && questions.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{sessionData?.jobTitle}</h1>
          <p className="text-gray-600">{sessionData?.industry} • {sessionData?.experienceLevel}</p>
        </div>

        {sessionData?.status === 'completed' ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Interview Completed!</h2>
              {sessionData.readinessScore !== null && (
                <div className="mt-6">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {sessionData.readinessScore}%
                  </div>
                  <p className="text-gray-600">Readiness Score</p>
                </div>
              )}
              <Link href={`/interview/${sessionId}/results`}>
                <Button className="mt-6">View Detailed Results</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Interview Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {questions.map((question, idx) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-primary">
                              Question {idx + 1}
                            </span>
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                              {question.type}
                            </span>
                          </div>
                          <p className="font-medium">{question.question}</p>
                        </div>
                        {question.answer && (
                          <div className="ml-4">
                            <div className="text-2xl font-bold text-green-600">
                              {question.answer.score}%
                            </div>
                          </div>
                        )}
                      </div>
                      {question.answer ? (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700 mb-2">
                            <strong>Your Answer:</strong> {question.answer.answer}
                          </p>
                          {question.answer.feedback && (
                            <p className="text-sm text-gray-600">
                              <strong>Feedback:</strong> {question.answer.feedback}
                            </p>
                          )}
                        </div>
                      ) : (
                        <Link href={`/interview/${sessionId}/questions/${question.id}`}>
                          <Button variant="outline" size="sm" className="mt-2">
                            Answer Question
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                {answeredCount} of {questions.length} questions answered
              </p>
              {allAnswered && (
                <Button onClick={handleComplete}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Complete & Get Score
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

