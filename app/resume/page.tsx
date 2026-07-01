'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'
import { FileText, Plus, Edit, Trash2, Clock, Sparkles } from 'lucide-react'

interface Resume {
  id: string
  title: string
  status: string
  updatedAt: string
  createdAt: string
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ResumeListPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (status === 'authenticated') fetchResumes()
  }, [status, router])

  const fetchResumes = async () => {
    try {
      const res = await fetch('/api/resumes')
      if (res.ok) setResumes(await res.json())
    } catch (e) {
      console.error('Failed to fetch resumes', e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resume? This cannot be undone.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: 'DELETE' })
      if (res.ok) setResumes((prev) => prev.filter((r) => r.id !== id))
    } catch (e) {
      console.error('Failed to delete resume', e)
    } finally {
      setDeleting(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Resumes</h1>
            {resumes.length > 0 && (
              <p className="text-sm text-gray-500 mt-0.5">{resumes.length} resume{resumes.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          <Link href="/resume/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto min-h-[44px] gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 border-0">
              <Plus className="h-4 w-4" />
              New Resume
            </Button>
          </Link>
        </div>

        {resumes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">No resumes yet</h3>
              <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">
                Build an ATS-optimized resume in minutes — AI writes the content, you choose the style
              </p>
              <Link href="/resume/new">
                <Button className="min-h-[44px] gap-2">
                  <Sparkles className="h-4 w-4" />
                  Build My Resume
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {resumes.map((resume) => (
              <Card key={resume.id} className="hover:shadow-md transition-shadow group">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm sm:text-base font-semibold truncate">
                        {resume.title}
                      </CardTitle>
                      <CardDescription className="text-xs capitalize">
                        {resume.status === 'completed' ? 'Complete' : 'Draft'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeAgo(resume.updatedAt || resume.createdAt)}
                    </span>
                    <div className="flex gap-1.5">
                      <Link href={`/resume/${resume.id}`}>
                        <Button variant="outline" size="sm" className="h-8 px-2.5 gap-1 text-xs">
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-red-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(resume.id)}
                        disabled={deleting === resume.id}
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
