'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'
import { ResumePreview } from '@/components/resume/ResumePreview'
import { SAMPLE_RESUME_DATA } from '@/lib/resume/sampleData'

type DbTemplate = {
  id: string
  name: string
  category: string
  isPremium: boolean
  supportsPhoto: boolean
  metadata: Record<string, unknown> | null
}

function resolveTemplateKey(t: DbTemplate): string {
  const meta = (t.metadata ?? {}) as Record<string, unknown>
  if (typeof meta.templateKey === 'string' && meta.templateKey) return meta.templateKey
  // Category fallback
  const map: Record<string, string> = {
    classic: 'dubai-classic',
    minimal: 'sharjah-minimal',
    executive: 'abu-dhabi-executive',
    modern: 'gulf-modern',
  }
  return map[t.category?.toLowerCase()] || 'dubai-classic'
}

export default function NewResumePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [templates, setTemplates] = useState<DbTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetch('/api/resumes/templates')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: DbTemplate[]) => {
        setTemplates(data)
        if (data.length > 0) setSelectedTemplate(data[0].id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !selectedTemplate) return
    setCreating(true)
    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), templateId: selectedTemplate }),
      })
      if (res.ok) {
        const resume = await res.json()
        router.push(`/resume/${resume.id}`)
      } else {
        alert('Failed to create resume')
      }
    } catch {
      alert('Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="px-4 sm:px-6 pt-6">
            <CardTitle className="text-xl sm:text-2xl">Create New Resume</CardTitle>
            <CardDescription className="text-sm sm:text-base mt-2">
              Pick a template and name your resume. You can change the template anytime.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6">
            <form onSubmit={handleCreate} className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm sm:text-base">Resume Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Software Engineer Resume for Dubai"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="min-h-[44px] text-base"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Choose a Template</Label>
                {loading ? (
                  <div className="text-center py-8 text-sm text-gray-500">Loading templates…</div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">No templates available</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {templates.map((t) => {
                      const templateKey = resolveTemplateKey(t)
                      const isSelected = selectedTemplate === t.id
                      const description = (t.metadata as Record<string, unknown>)?.description as string | undefined

                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedTemplate(t.id)}
                          className={[
                            'text-left rounded-lg border-2 overflow-hidden transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                            isSelected
                              ? 'border-primary shadow-md'
                              : 'border-gray-200 hover:border-gray-400 hover:shadow-sm',
                          ].join(' ')}
                        >
                          {/* Live template thumbnail — same component as the editor */}
                          <div className="w-full overflow-hidden bg-white" style={{ height: '200px' }}>
                            <ResumePreview
                              data={SAMPLE_RESUME_DATA}
                              templateKey={templateKey}
                            />
                          </div>

                          {/* Card footer */}
                          <div className="px-3 py-2 bg-white border-t border-gray-100">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-semibold text-gray-800 truncate">
                                {t.name}
                              </span>
                              {t.isPremium && (
                                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded flex-shrink-0">
                                  Pro
                                </span>
                              )}
                            </div>
                            {description && (
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight line-clamp-1">
                                {description}
                              </p>
                            )}
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-gray-400 capitalize">{t.category}</span>
                              {t.supportsPhoto && (
                                <span className="text-[10px] text-gray-400">· Photo</span>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto min-h-[44px] sm:order-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating || !title.trim() || !selectedTemplate}
                  className="w-full sm:w-auto min-h-[44px] sm:order-2"
                >
                  {creating ? 'Creating…' : 'Create Resume'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
