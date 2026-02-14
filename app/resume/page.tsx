'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'
import { FileText, Plus, Edit, Trash2 } from 'lucide-react'

interface Resume {
  id: string
  title: string
  status: string
  updatedAt: string
}

export default function ResumeListPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (status === 'authenticated') {
      fetchResumes()
    }
  }, [status, router])

  const fetchResumes = async () => {
    try {
      const response = await fetch('/api/resumes')
      if (response.ok) {
        const data = await response.json()
        setResumes(data)
      }
    } catch (error) {
      console.error('Failed to fetch resumes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return

    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchResumes()
      }
    } catch (error) {
      console.error('Failed to delete resume:', error)
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">My ATS-Optimized Resumes</h1>
          <Link href="/resume/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto min-h-[44px]">
              <Plus className="h-4 w-4 mr-2" />
              Create New Resume
            </Button>
          </Link>
        </div>

        {resumes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
              <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" aria-hidden="true" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">No resumes yet</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 text-center">Create your first ATS-optimized resume for UAE jobs</p>
              <Link href="/resume/new" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto min-h-[44px]">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Resume
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {resumes.map((resume) => (
              <Card key={resume.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" aria-hidden="true" />
                    <span className="truncate">{resume.title}</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {resume.status === 'completed' ? 'Completed' : 'Draft'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <span className="text-xs sm:text-sm text-gray-600">
                      Updated {new Date(resume.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Link href={`/resume/${resume.id}`} className="flex-1 sm:flex-none">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[40px]">
                          <Edit className="h-4 w-4" aria-label="Edit resume" />
                          <span className="ml-2 sm:hidden">Edit</span>
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(resume.id)}
                        className="min-h-[40px]"
                      >
                        <Trash2 className="h-4 w-4" aria-label="Delete resume" />
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

