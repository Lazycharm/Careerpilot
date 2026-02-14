'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'

export default function NewResumePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/resumes/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
        if (data.length > 0) {
          setSelectedTemplate(data[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !selectedTemplate) return

    setCreating(true)
    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          templateId: selectedTemplate,
        }),
      })

      if (response.ok) {
        const resume = await response.json()
        router.push(`/resume/${resume.id}`)
      } else {
        alert('Failed to create resume')
      }
    } catch (error) {
      console.error('Failed to create resume:', error)
      alert('Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="px-4 sm:px-6 pt-6">
            <CardTitle className="text-xl sm:text-2xl">Create New ATS-Optimized Resume</CardTitle>
            <CardDescription className="text-sm sm:text-base mt-2">
              Choose an ATS-friendly template and give your resume a title for UAE jobs
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
                  className="min-h-[44px] text-base sm:text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Choose ATS-Friendly Template</Label>
                {loading ? (
                  <div className="text-center py-8 text-sm sm:text-base">Loading templates...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {templates.map((template) => {
                      const metadata = template.metadata as any
                      const description = metadata?.description || 'Professional resume template'
                      const isPremium = template.isPremium || false
                      const category = template.category || 'modern'
                      
                      return (
                        <Card
                          key={template.id}
                          className={`cursor-pointer transition-all hover:shadow-lg ${
                            selectedTemplate === template.id
                              ? 'border-primary border-2 shadow-md'
                              : 'border-gray-200'
                          }`}
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          <CardContent className="p-4 sm:p-5">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-sm sm:text-base font-semibold">
                                    {template.name}
                                  </h3>
                                  {isPremium && (
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                      Premium
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                  {description}
                                </p>
                              </div>
                            </div>
                            
                            {/* Template Preview */}
                            <div className="w-full h-32 sm:h-40 bg-white rounded border-2 border-gray-200 relative overflow-hidden shadow-sm">
                              {template.previewImage ? (
                                <img 
                                  src={template.previewImage} 
                                  alt={template.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 p-2 flex flex-col">
                                  {/* Template-specific visual preview */}
                                  {category === 'modern' && (
                                    <>
                                      <div className="h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded mb-2"></div>
                                      <div className="space-y-1 flex-1">
                                        <div className="h-1 bg-blue-200 rounded w-full"></div>
                                        <div className="h-1 bg-gray-200 rounded w-4/5"></div>
                                        <div className="h-1 bg-gray-100 rounded w-3/5"></div>
                                        {template.supportsPhoto && (
                                          <div className="flex items-center gap-2 mt-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-blue-500"></div>
                                            <div className="flex-1 space-y-1">
                                              <div className="h-1 bg-gray-200 rounded w-full"></div>
                                              <div className="h-1 bg-gray-100 rounded w-2/3"></div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  )}
                                  {category === 'classic' && (
                                    <>
                                      <div className="h-1 bg-black rounded mb-3"></div>
                                      <div className="space-y-1.5 flex-1">
                                        <div className="h-1 bg-gray-400 rounded w-full"></div>
                                        <div className="h-1 bg-gray-300 rounded w-full"></div>
                                        <div className="h-1 bg-gray-200 rounded w-4/5"></div>
                                        <div className="h-1 bg-gray-200 rounded w-3/5"></div>
                                      </div>
                                    </>
                                  )}
                                  {category === 'creative' && (
                                    <>
                                      <div className="flex gap-2 mb-2">
                                        <div className="h-8 bg-red-500 rounded-l w-1/4"></div>
                                        <div className="flex-1 space-y-1">
                                          <div className="h-1 bg-gray-300 rounded w-full"></div>
                                          <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                                        </div>
                                      </div>
                                      {template.supportsPhoto && (
                                        <div className="flex items-center gap-2 mt-2">
                                          <div className="w-10 h-10 rounded-full bg-gray-300 border-3 border-red-500"></div>
                                          <div className="flex-1 space-y-1">
                                            <div className="h-1 bg-gray-200 rounded w-full"></div>
                                            <div className="h-1 bg-gray-100 rounded w-2/3"></div>
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  )}
                                  {category === 'premium' && (
                                    <>
                                      <div className="h-8 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 rounded mb-2"></div>
                                      <div className="space-y-1.5 flex-1">
                                        <div className="h-1 bg-gray-400 rounded w-full"></div>
                                        <div className="h-1 bg-gray-300 rounded w-full"></div>
                                        <div className="h-1 bg-gray-200 rounded w-4/5"></div>
                                        {template.supportsPhoto && (
                                          <div className="flex items-center gap-2 mt-2">
                                            <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-yellow-600"></div>
                                            <div className="flex-1 space-y-1">
                                              <div className="h-1 bg-gray-200 rounded w-full"></div>
                                              <div className="h-1 bg-gray-100 rounded w-2/3"></div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {/* Category badge */}
                            <div className="mt-3 flex items-center gap-2">
                              <span className="text-xs text-gray-500 capitalize">
                                {category}
                              </span>
                              {template.supportsPhoto && (
                                <span className="text-xs text-gray-400">• Photo</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto min-h-[44px] order-2 sm:order-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={creating || !title.trim() || !selectedTemplate}
                  className="w-full sm:w-auto min-h-[44px] order-1 sm:order-2"
                >
                  {creating ? 'Creating...' : 'Create Resume'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

