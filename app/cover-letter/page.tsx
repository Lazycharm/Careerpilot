'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'
import { MessageSquare, Plus, Edit, Trash2 } from 'lucide-react'

interface CoverLetter {
  id: string
  jobTitle: string
  industry: string
  createdAt: string
}

export default function CoverLetterListPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (status === 'authenticated') {
      fetchCoverLetters()
    }
  }, [status, router])

  const fetchCoverLetters = async () => {
    try {
      const response = await fetch('/api/cover-letters')
      if (response.ok) {
        const data = await response.json()
        setCoverLetters(data)
      }
    } catch (error) {
      console.error('Failed to fetch cover letters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cover letter?')) return

    try {
      const response = await fetch(`/api/cover-letters/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchCoverLetters()
      }
    } catch (error) {
      console.error('Failed to delete cover letter:', error)
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
          <h1 className="text-3xl font-bold">My Cover Letters</h1>
          <Link href="/cover-letter/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate New Cover Letter
            </Button>
          </Link>
        </div>

        {coverLetters.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No cover letters yet</h3>
              <p className="text-gray-600 mb-4">Generate your first AI-powered cover letter</p>
              <Link href="/cover-letter/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Cover Letter
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coverLetters.map((letter) => (
              <Card key={letter.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {letter.jobTitle}
                  </CardTitle>
                  <CardDescription>{letter.industry}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {new Date(letter.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Link href={`/cover-letter/${letter.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(letter.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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

