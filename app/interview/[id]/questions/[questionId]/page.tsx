'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Navbar } from '@/components/shared/Navbar'
import { Save, Sparkles } from 'lucide-react'

export default function AnswerQuestionPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string
  const questionId = params.questionId as string

  const [question, setQuestion] = useState<any>(null)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    fetchQuestion()
  }, [questionId])

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`/api/interviews/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        const q = data.questions.find((q: any) => q.id === questionId)
        if (q) {
          setQuestion(q)
          if (q.answer) {
            setAnswer(q.answer.answer)
            setResult({
              score: q.answer.score,
              feedback: q.answer.feedback,
            })
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch question:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!answer.trim()) {
      alert('Please provide an answer')
      return
    }

    setAnalyzing(true)
    try {
      const response = await fetch(`/api/interviews/${sessionId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, answer }),
      })

      if (response.ok) {
        const analysis = await response.json()
        setResult(analysis)
        // Refresh to show updated answer
        fetchQuestion()
      } else {
        alert('Failed to analyze answer')
      }
    } catch (error) {
      console.error('Failed to analyze answer:', error)
      alert('Something went wrong')
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-24 rounded-xl mb-6" />
          <Skeleton className="h-40 rounded-xl mb-4" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Interview Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded">
                  {question?.type}
                </span>
              </div>
              <p className="text-lg font-medium">{question?.question}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your Answer</label>
              <textarea
                className="w-full min-h-[200px] rounded-md border border-input bg-background px-4 py-3 text-sm"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
              />
            </div>

            {result && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">AI Analysis</span>
                  <span className="text-2xl font-bold text-primary">
                    {result.score}%
                  </span>
                </div>
                {result.feedback && (
                  <p className="text-sm text-gray-700">{result.feedback}</p>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                Back
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={analyzing || !answer.trim()}
              >
                {analyzing ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Answer
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

