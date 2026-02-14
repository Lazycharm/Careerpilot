'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'
import { Sparkles, FileText, Calendar } from 'lucide-react'
import type { ResumeData } from '@/types'

interface Resume {
  id: string
  title: string
  status: string
  updatedAt: string
}

export default function NewCoverLetterPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    jobTitle: '',
    industry: '',
    companyName: '',
    companyAddress: '',
    resumeId: '',
    // Contact information fields
    name: '',
    address: '',
    cityCountry: '',
    phone: '',
    email: '',
    date: '',
  })
  const [resumes, setResumes] = useState<Resume[]>([])
  const [selectedResumeData, setSelectedResumeData] = useState<ResumeData | null>(null)
  const [loadingResumes, setLoadingResumes] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch user's resumes
  useEffect(() => {
    if (session?.user) {
      fetchResumes()
    }
  }, [session])

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
      setLoadingResumes(false)
    }
  }

  // Fetch selected resume data
  const handleResumeChange = async (resumeId: string) => {
    setFormData({ ...formData, resumeId })
    if (!resumeId) {
      setSelectedResumeData(null)
      return
    }

    try {
      const response = await fetch(`/api/resumes/${resumeId}`)
      if (response.ok) {
        const resume = await response.json()
        setSelectedResumeData(resume.data as ResumeData)
      }
    } catch (error) {
      console.error('Failed to fetch resume data:', error)
      setSelectedResumeData(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload: any = {
        jobTitle: formData.jobTitle,
        industry: formData.industry,
        companyName: formData.companyName,
        companyAddress: formData.companyAddress || undefined,
        // Contact information
        contactInfo: {
          name: formData.name || undefined,
          address: formData.address || undefined,
          cityCountry: formData.cityCountry || undefined,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          date: formData.date || undefined,
        },
      }

      // Include resume data if selected
      if (formData.resumeId && selectedResumeData) {
        payload.resumeId = formData.resumeId
        payload.resumeData = selectedResumeData
      }

      const response = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/cover-letter/${data.id}`)
      } else {
        setError(data.error || 'Failed to generate cover letter')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              Generate AI Cover Letter
            </CardTitle>
            <CardDescription>
              Let AI create a professional cover letter tailored for UAE job market
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Software Engineer"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Input
                  id="industry"
                  placeholder="e.g., Technology, Finance, Healthcare"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name (Optional)</Label>
                <Input
                  id="companyName"
                  placeholder="e.g., ABC Company"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAddress">Company Address (Optional)</Label>
                <Input
                  id="companyAddress"
                  placeholder="e.g., Business Bay, Dubai, UAE"
                  value={formData.companyAddress}
                  onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                />
              </div>

              {/* Contact Information Section */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Your Contact Information</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Fill in your contact details. Only filled fields will appear in the cover letter.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g., john.doe@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="e.g., +971 50 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cityCountry">City, Country</Label>
                    <Input
                      id="cityCountry"
                      placeholder="e.g., Dubai, UAE"
                      value={formData.cityCountry}
                      onChange={(e) => setFormData({ ...formData, cityCountry: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address (Optional)</Label>
                    <Input
                      id="address"
                      placeholder="e.g., P.O. Box 12345, Building Name, Street Name"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date (Optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="date"
                        type="date"
                        value={(() => {
                          if (!formData.date) return ''
                          // Try to parse the formatted date string back to ISO format
                          try {
                            const parsed = new Date(formData.date)
                            if (!isNaN(parsed.getTime())) {
                              return parsed.toISOString().split('T')[0]
                            }
                          } catch {}
                          return ''
                        })()}
                        onChange={(e) => {
                          if (e.target.value) {
                            const selectedDate = new Date(e.target.value + 'T00:00:00')
                            const formattedDate = selectedDate.toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })
                            setFormData({ ...formData, date: formattedDate })
                          } else {
                            setFormData({ ...formData, date: '' })
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const today = new Date().toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                          setFormData({ ...formData, date: today })
                        }}
                        className="whitespace-nowrap"
                        title="Use today's date"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Today
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formData.date 
                        ? `Selected: ${formData.date}` 
                        : 'Leave empty or click "Today" to use today\'s date'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resumeId" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  Select Resume (Optional)
                </Label>
                {loadingResumes ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-500">
                    Loading resumes...
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-500">
                    No resumes available. Create a resume first to use this feature.
                  </div>
                ) : (
                  <>
                    <select
                      id="resumeId"
                      value={formData.resumeId}
                      onChange={(e) => handleResumeChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                    >
                      <option value="">-- No resume selected (optional) --</option>
                      {resumes.map((resume) => (
                        <option key={resume.id} value={resume.id}>
                          {resume.title} {resume.status === 'completed' ? '✓' : '(Draft)'}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedResumeData ? (
                        <span className="text-green-600 font-medium">
                          ✓ Resume selected - AI will tailor cover letter based on your resume content
                        </span>
                      ) : (
                        'Select a resume to help AI create a more personalized and tailored cover letter'
                      )}
                    </p>
                  </>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Cover Letter
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

