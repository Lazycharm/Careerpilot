'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'
import { MessageSquare, Plus, Edit, Trash2, Clock } from 'lucide-react'

interface CoverLetter {
  id: string
  jobTitle: string
  industry: string
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

export default function CoverLetterListPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (status === 'authenticated') fetchCoverLetters()
  }, [status, router])

  const fetchCoverLetters = async () => {
    try {
      const res = await fetch('/api/cover-letters')
      if (res.ok) setCoverLetters(await res.json())
    } catch (e) {
      console.error('Failed to fetch cover letters', e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this cover letter? This cannot be undone.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/cover-letters/${id}`, { method: 'DELETE' })
      if (res.ok) setCoverLetters(prev => prev.filter(cl => cl.id !== id))
    } catch (e) {
      console.error('Failed to delete cover letter', e)
    } finally {
      setDeleting(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Cover Letters</h1>
            {coverLetters.length > 0 && (
              <p className="text-sm text-gray-500 mt-0.5">{coverLetters.length} letter{coverLetters.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          <Link href="/cover-letter/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto min-h-[44px] gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 border-0">
              <Plus className="h-4 w-4" />
              New Cover Letter
            </Button>
          </Link>
        </div>

        {coverLetters.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-violet-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">No cover letters yet</h3>
              <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">
                AI writes your first cover letter in under 30 seconds — tailored for UAE employers
              </p>
              <Link href="/cover-letter/new">
                <Button className="min-h-[44px] gap-2">
                  <Plus className="h-4 w-4" />
                  Write My First Cover Letter
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {coverLetters.map((letter) => (
              <Card key={letter.id} className="hover:shadow-md transition-shadow group">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageSquare className="h-4 w-4 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm sm:text-base font-semibold truncate">
                        {letter.jobTitle}
                      </CardTitle>
                      <CardDescription className="text-xs">{letter.industry}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeAgo(letter.updatedAt || letter.createdAt)}
                    </span>
                    <div className="flex gap-1.5">
                      <Link href={`/cover-letter/${letter.id}`}>
                        <Button variant="outline" size="sm" className="h-8 px-2.5 gap-1 text-xs">
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-red-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(letter.id)}
                        disabled={deleting === letter.id}
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
