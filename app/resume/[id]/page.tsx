'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'
import { Save, Download, Plus, Trash2, Sparkles, Eye } from 'lucide-react'
import type { ResumeData } from '@/types'
import { AIAssistant, AIButton } from '@/components/resume/AIAssistant'
import { TailorResumeDialog } from '@/components/resume/TailorResumeDialog'
import { ResumePreview } from '@/components/resume/ResumePreview'
import { ATSOptimizer } from '@/components/resume/ATSOptimizer'
import { CustomizationPanel } from '@/components/resume/CustomizationPanel'
import { PDFPreviewDialog } from '@/components/resume/PDFPreviewDialog'
import { WizardProgress } from '@/components/resume/WizardProgress'
import { defaultCustomization } from '@/lib/resume/customization'
import { SuggestInput } from '@/components/ui/suggest-input'
import { SkillTagInput } from '@/components/ui/skill-tag-input'
import { UAE_LOCATIONS, JOB_TITLES, EDUCATION_FIELDS } from '@/lib/suggestions'

export default function ResumeEditorPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const resumeId = params.id as string

  const [resume, setResume] = useState<any>(null)
  const [data, setData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
    },
    summary: '',
    workExperience: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])
  const [changingTemplate, setChangingTemplate] = useState(false)
  
  // AI state
  const [aiSummaryPreview, setAiSummaryPreview] = useState<string | null>(null)
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false)
  const [aiExperiencePreviews, setAiExperiencePreviews] = useState<Record<number, string[]>>({})
  const [aiExperienceLoading, setAiExperienceLoading] = useState<Record<number, boolean>>({})
  const [aiSkillsPreview, setAiSkillsPreview] = useState<string[] | null>(null)
  const [aiSkillsLoading, setAiSkillsLoading] = useState(false)
  const [tailorDialogOpen, setTailorDialogOpen] = useState(false)
  const [tailoring, setTailoring] = useState(false)
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false)

  useEffect(() => {
    if (resumeId) {
      fetchResume()
    }
  }, [resumeId])
  
  // Fetch templates when resume template changes
  useEffect(() => {
    if (resume?.template) {
      fetchTemplates(resume.template)
    }
  }, [resume?.template?.id])

  const fetchTemplates = async (currentTemplate?: any) => {
    try {
      const response = await fetch('/api/resumes/templates')
      if (response.ok) {
        const data = await response.json()
        // Ensure current template is included if it's not in the list
        if (currentTemplate && !data.find((t: any) => t.id === currentTemplate.id)) {
          data.push({
            id: currentTemplate.id,
            name: currentTemplate.name,
            isPremium: currentTemplate.isPremium,
            category: currentTemplate.category,
            metadata: currentTemplate.metadata,
          })
        }
        setTemplates(data)
        console.log('Templates loaded:', data.length)
      } else {
        console.error('Failed to fetch templates:', response.status)
        // If fetch fails but we have a template, use it as fallback
        if (currentTemplate) {
          setTemplates([{
            id: currentTemplate.id,
            name: currentTemplate.name,
            isPremium: currentTemplate.isPremium,
            category: currentTemplate.category,
            metadata: currentTemplate.metadata,
          }])
        }
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
      // If fetch fails but we have a template, use it as fallback
      if (currentTemplate) {
        setTemplates([{
          id: currentTemplate.id,
          name: currentTemplate.name,
          isPremium: currentTemplate.isPremium,
          category: currentTemplate.category,
          metadata: currentTemplate.metadata,
        }])
      }
    }
  }

  const fetchResume = async () => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`)
      if (response.ok) {
        const resumeData = await response.json()
        setResume(resumeData)
        const loadedData = resumeData.data as ResumeData
        
        // Ensure skills have proper structure
        if (loadedData.skills && Array.isArray(loadedData.skills)) {
          loadedData.skills = loadedData.skills.map((skill: any) => ({
            category: skill?.category || 'Skills',
            items: Array.isArray(skill?.items) ? skill.items : []
          }))
        } else {
          loadedData.skills = []
        }
        
        setData(loadedData)
        
        // Fetch templates after resume is loaded (so we can include current template)
        if (resumeData.template) {
          fetchTemplates(resumeData.template)
        }
      }
    } catch (error) {
      console.error('Failed to fetch resume:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      })
      if (response.ok) {
        alert('Resume saved!')
      }
    } catch (error) {
      console.error('Failed to save resume:', error)
      alert('Failed to save resume')
    } finally {
      setSaving(false)
    }
  }

  const handleTemplateChange = async (newTemplateId: string) => {
    if (!resume || newTemplateId === resume.templateId) return
    
    setChangingTemplate(true)
    try {
      // Update templateId while preserving current data
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          templateId: newTemplateId,
          data: data // Preserve current user input
        }),
      })
      
      if (response.ok) {
        // Fetch the new template details
        const templateResponse = await fetch(`/api/resumes/templates`)
        if (templateResponse.ok) {
          const allTemplates = await templateResponse.json()
          const newTemplate = allTemplates.find((t: any) => t.id === newTemplateId)
          if (newTemplate) {
            // Update resume state with new template info, but keep current data state
            setResume((prev: any) => ({
              ...prev,
              template: newTemplate,
              templateId: newTemplateId
            }))
          }
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to change template')
      }
    } catch (error) {
      console.error('Failed to change template:', error)
      alert('Failed to change template')
    } finally {
      setChangingTemplate(false)
    }
  }

  const handleMarkComplete = async () => {
    if (!confirm('Mark this resume as completed?')) return
    setSaving(true)
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, status: 'completed' }),
      })
      if (response.ok) {
        alert('Resume marked as completed!')
        router.push('/resume')
      }
    } catch (error) {
      console.error('Failed to update resume:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleApplyATSSuggestion = async (suggestion: any, missingKeywords?: string[]) => {
    const { type, section, message, suggestion: suggestionText } = suggestion

    // Handle keyword suggestions - add missing keywords to skills
    if (type === 'keyword') {
      let keywords: string[] = []
      
      if (missingKeywords && missingKeywords.length > 0) {
        keywords = missingKeywords.slice(0, 8)
      } else {
        const pattern1 = suggestionText.match(/keywords[^:]*:\s*([^.]+)/i)
        if (pattern1) {
          keywords = pattern1[1]
            .split(/[,;]/)
            .map((k: string) => k.trim())
            .filter((k: string) => k.length > 0 && k.length < 50)
            .slice(0, 8)
        }
      }

      if (keywords.length > 0) {
        const updatedSkills = [...data.skills]
        const existingSkillsGroup = updatedSkills.find(s => 
          s.category === 'Skills' || 
          s.category === 'Technical Skills' ||
          s.category === 'Relevant Skills'
        )
        
        if (existingSkillsGroup) {
          const currentItems = existingSkillsGroup.items || []
          const newItems = [...currentItems]
          keywords.forEach(keyword => {
            if (!newItems.some(item => item.toLowerCase() === keyword.toLowerCase())) {
              newItems.push(keyword)
            }
          })
          existingSkillsGroup.items = newItems
          const groupIndex = updatedSkills.indexOf(existingSkillsGroup)
          updatedSkills[groupIndex] = existingSkillsGroup
        } else {
          updatedSkills.push({
            category: 'Skills',
            items: keywords,
          })
        }
        
        setData({ ...data, skills: updatedSkills })
        alert(`✓ Applied: Added ${keywords.length} keyword${keywords.length > 1 ? 's' : ''} to your skills section.`)
        
        setTimeout(() => {
          const skillsCard = document.querySelector('[data-section="skills"]')
          skillsCard?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
        return
      }
    }

    // Handle content suggestions with AI auto-apply
    if (type === 'content') {
      if (section === 'summary') {
        const summaryCard = document.querySelector('[data-section="summary"]')
        summaryCard?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        
        if (message.includes('missing') || message.includes('too short')) {
          // Auto-generate summary with AI
          setAiSummaryLoading(true)
          try {
            const response = await fetch('/api/ai/resume/summary', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jobTitle: data.workExperience[0]?.position || '',
                industry: '',
                yearsOfExperience: data.workExperience.length,
                currentRole: data.workExperience[0]?.position || '',
                keySkills: data.skills.flatMap(s => s.items || []),
              }),
            })
            if (response.ok) {
              const result = await response.json()
              setData({ ...data, summary: result.summary })
              setAiSummaryLoading(false)
              alert('✓ Applied: AI-generated professional summary has been added to your resume.')
            } else {
              const error = await response.json()
              alert(`Failed to generate summary: ${error.error || 'Unknown error'}`)
              setAiSummaryLoading(false)
            }
          } catch (error) {
            console.error('AI summary error:', error)
            alert('Failed to generate summary. Please try again.')
            setAiSummaryLoading(false)
          }
        } else {
          // Improve existing summary
          setAiSummaryLoading(true)
          try {
            const response = await fetch('/api/ai/resume/summary', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jobTitle: data.workExperience[0]?.position || '',
                industry: '',
                yearsOfExperience: data.workExperience.length,
                currentRole: data.workExperience[0]?.position || '',
                keySkills: data.skills.flatMap(s => s.items || []),
              }),
            })
            if (response.ok) {
              const result = await response.json()
              setData({ ...data, summary: result.summary })
              setAiSummaryLoading(false)
              alert('✓ Applied: Your summary has been improved with AI.')
            } else {
              setAiSummaryLoading(false)
            }
          } catch (error) {
            setAiSummaryLoading(false)
          }
        }
        return
      }

      if (section === 'skills') {
        const skillsCard = document.querySelector('[data-section="skills"]')
        skillsCard?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        
        if (message.includes('No skills') || message.includes('more comprehensive')) {
          // Auto-generate skills with AI
          setAiSkillsLoading(true)
          try {
            const response = await fetch('/api/ai/resume/skills', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jobTitle: data.workExperience[0]?.position || '',
                industry: '',
                currentSkills: data.skills.flatMap(s => s.items || []),
                experienceLevel: data.workExperience.length > 5 ? 'senior' : 'mid',
              }),
            })
            if (response.ok) {
              const result = await response.json()
              const suggestedSkills = result.skills || []
              if (suggestedSkills.length > 0) {
                const updatedSkills = [...data.skills]
                const existingGroup = updatedSkills.find(s => s.category === 'Skills')
                if (existingGroup) {
                  const newItems = [...(existingGroup.items || []), ...suggestedSkills]
                  existingGroup.items = [...new Set(newItems)]
                  const idx = updatedSkills.indexOf(existingGroup)
                  updatedSkills[idx] = existingGroup
                } else {
                  updatedSkills.push({
                    category: 'Skills',
                    items: suggestedSkills,
                  })
                }
                setData({ ...data, skills: updatedSkills })
                alert(`✓ Applied: Added ${suggestedSkills.length} AI-suggested skills to your resume.`)
              }
            }
            setAiSkillsLoading(false)
          } catch (error) {
            console.error('AI skills error:', error)
            setAiSkillsLoading(false)
          }
        }
        return
      }

      if (section.startsWith('workExperience')) {
        const indexMatch = section.match(/\[(\d+)\]/)
        const expIndex = indexMatch ? parseInt(indexMatch[1]) : null
        
        const workExpCard = document.querySelector('[data-section="workExperience"]')
        workExpCard?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        
        if ((message.includes('no description') || message.includes('needs more detail') || message.includes('quantifiable')) && expIndex !== null && data.workExperience[expIndex]) {
          const exp = data.workExperience[expIndex]
          if (!exp.company || !exp.position) {
            alert('Please enter company and position first.')
            return
          }
          
          // Auto-improve with AI
          setAiExperienceLoading({ ...aiExperienceLoading, [expIndex]: true })
          try {
            const response = await fetch('/api/ai/resume/experience', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                company: exp.company,
                position: exp.position,
                description: exp.description || [],
                jobTitle: exp.position,
                industry: '',
              }),
            })
            if (response.ok) {
              const result = await response.json()
              const improvedBullets = result.bullets || []
              if (improvedBullets.length > 0) {
                const updated = [...data.workExperience]
                updated[expIndex] = {
                  ...updated[expIndex],
                  description: improvedBullets,
                }
                setData({ ...data, workExperience: updated })
                alert(`✓ Applied: Improved work experience description with AI-generated bullet points.`)
              }
            }
            setAiExperienceLoading({ ...aiExperienceLoading, [expIndex]: false })
          } catch (error) {
            console.error('AI experience error:', error)
            setAiExperienceLoading({ ...aiExperienceLoading, [expIndex]: false })
          }
        }
        return
      }

      if (section === 'education' || section === 'personalInfo') {
        const card = document.querySelector(`[data-section="${section}"]`)
        card?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        alert(`Please complete the ${section === 'education' ? 'Education' : 'Personal Information'} section above.`)
        return
      }
    }

    // Handle format/structure suggestions
    if (type === 'format' || type === 'structure') {
      alert(`Suggestion: ${suggestionText}\n\nPlease review the ${section} section and make the recommended changes.`)
      return
    }

    alert(`Suggestion applied. Please review the ${section} section: ${suggestionText}`)
  }

  const handleDownload = async (pdfType: 'a4' | 'long-scroll' = 'a4') => {
    // Phase 1: server-side React-PDF rendering. We always get a real PDF
    // back from /api/resumes/[id]/export — the html2canvas client fallback
    // and the `?type=long-scroll` mode have been removed (long-scroll
    // produced a single oversized page that no ATS could parse).
    try {
      const response = await fetch(`/api/resumes/${resumeId}/export`)

      if (response.status === 403) {
        const error = await response.json()
        if (error.requiresPayment) {
          router.push(`/subscription?redirect=/resume/${resumeId}`)
          return
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to download resume' }))
        alert(error.error || 'Failed to download resume')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${resume?.title || 'resume'}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('PDF generation error:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <WizardProgress
        completedSections={{
          contacts: !!(data.personalInfo.fullName && data.personalInfo.email),
          experience: data.workExperience.length > 0,
          education: data.education.length > 0,
          skills: data.skills.length > 0 && data.skills.some(s => s.items.length > 0),
          summary: !!data.summary,
          finalize: !!(data.certifications?.length || data.languages?.length),
        }}
        activeSection={undefined}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3">{resume?.title || 'Edit Resume'}</h1>
            {resume?.template && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                <span className="font-medium whitespace-nowrap">Template:</span>
                {templates.length > 0 ? (
                  <select
                    value={resume.templateId}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    disabled={changingTemplate || templates.length === 0}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold border border-blue-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto sm:min-w-[200px]"
                  >
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}{template.isPremium ? ' (Premium)' : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <>
                    <span className="px-2.5 py-1.5 bg-blue-100 text-blue-800 rounded-md text-xs sm:text-sm font-semibold h-8 sm:h-9 flex items-center">
                      {resume.template.name}
                    </span>
                    {session?.user?.role === 'admin' && (
                      <span className="text-xs text-orange-600 flex items-center">
                        (No templates loaded. Go to Admin → Seed Templates)
                      </span>
                    )}
                  </>
                )}
                {resume.template.isPremium && (
                  <span className="px-2.5 py-1.5 bg-yellow-100 text-yellow-800 rounded-md text-xs sm:text-sm font-semibold h-8 sm:h-9 flex items-center">
                    Premium
                  </span>
                )}
                {(resume.template.metadata as any)?.description && (
                  <span className="text-gray-500 text-xs sm:text-sm flex items-center">
                    • {(resume.template.metadata as any).description}
                  </span>
                )}
                {changingTemplate && (
                  <span className="text-xs sm:text-sm text-blue-600 flex items-center">Changing template...</span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={handleSave} 
              disabled={saving} 
              size="sm" 
              className="h-9 px-3 sm:px-4 flex-1 sm:flex-none text-xs sm:text-sm font-medium whitespace-nowrap"
            >
              <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Draft'}</span>
              <span className="sm:hidden">{saving ? 'Saving...' : 'Save'}</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setPdfPreviewOpen(true)} 
              size="sm" 
              className="h-9 px-3 sm:px-4 flex-1 sm:flex-none text-xs sm:text-sm font-medium whitespace-nowrap"
            >
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Preview PDF</span>
              <span className="sm:hidden">Preview</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleDownload('a4')} 
              size="sm" 
              className="h-9 px-3 sm:px-4 flex-1 sm:flex-none text-xs sm:text-sm font-medium whitespace-nowrap"
              title="Download Professional PDF (A4 format with proper page breaks)"
            >
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setTailorDialogOpen(true)}
              disabled={tailoring}
              size="sm"
              className="h-9 px-3 sm:px-4 flex-1 sm:flex-none text-xs sm:text-sm font-medium whitespace-nowrap"
            >
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Tailor for Job</span>
              <span className="sm:hidden">Tailor</span>
            </Button>
            <Button 
              onClick={handleMarkComplete} 
              disabled={saving} 
              size="sm" 
              className="h-9 px-3 sm:px-4 flex-1 sm:flex-none text-xs sm:text-sm font-medium whitespace-nowrap"
            >
              <span className="hidden sm:inline">Mark as Completed</span>
              <span className="sm:hidden">Complete</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Form Section */}
          <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
            {/* Personal Info */}
            <Card id="section-personal" data-section="personalInfo">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resume?.template?.supportsPhoto && (
                  <div className="space-y-2">
                    <Label>Profile Photo (Optional)</Label>
                    <div className="flex items-center gap-4">
                      {data.personalInfo.photo && (
                        <img
                          src={data.personalInfo.photo}
                          alt="Profile"
                          className="w-20 h-20 rounded-full object-cover border"
                        />
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              setData({
                                ...data,
                                personalInfo: {
                                  ...data.personalInfo,
                                  photo: reader.result as string,
                                },
                              })
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        className="flex-1 min-h-[44px] text-sm sm:text-base"
                      />
                      {data.personalInfo.photo && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setData({
                              ...data,
                              personalInfo: { ...data.personalInfo, photo: undefined },
                            })
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      This template supports profile photos. Upload a professional headshot.
                    </p>
                  </div>
                )}
                {!resume?.template?.supportsPhoto && resume?.template && (
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-xs text-gray-600">
                      ℹ️ The <strong>{resume.template.name}</strong> template does not support profile photos.
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={data.personalInfo.fullName}
                    onChange={(e) =>
                      setData({
                        ...data,
                        personalInfo: { ...data.personalInfo, fullName: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={data.personalInfo.email}
                    onChange={(e) =>
                      setData({
                        ...data,
                        personalInfo: { ...data.personalInfo, email: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={data.personalInfo.phone}
                    onChange={(e) =>
                      setData({
                        ...data,
                        personalInfo: { ...data.personalInfo, phone: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <SuggestInput
                    value={data.personalInfo.location}
                    onChange={(val) =>
                      setData({ ...data, personalInfo: { ...data.personalInfo, location: val } })
                    }
                    suggestions={UAE_LOCATIONS}
                    placeholder="City, Country"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card id="section-summary" data-section="summary">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3">
                <CardTitle className="text-base sm:text-lg">Professional Summary</CardTitle>
                <AIButton
                  label="Generate with AI"
                  loading={aiSummaryLoading}
                  data-action="generate-summary"
                  onClick={async () => {
                    setAiSummaryLoading(true)
                    setAiSummaryPreview(null)
                    try {
                      const response = await fetch('/api/ai/resume/summary', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          jobTitle: data.workExperience[0]?.position || '',
                          industry: '',
                          yearsOfExperience: data.workExperience.length,
                          currentRole: data.workExperience[0]?.position || '',
                          keySkills: data.skills.flatMap(s => s.items || []),
                        }),
                      })
                      if (response.ok) {
                        const result = await response.json()
                        setAiSummaryPreview(result.summary)
                      } else {
                        const error = await response.json()
                        alert(error.error || 'Failed to generate summary')
                      }
                    } catch (error) {
                      console.error('AI summary error:', error)
                      alert('Failed to generate summary. Please try again.')
                    } finally {
                      setAiSummaryLoading(false)
                    }
                  }}
                />
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={data.summary}
                  onChange={(e) => setData({ ...data, summary: e.target.value })}
                  placeholder="Write a brief professional summary..."
                />
                <AIAssistant
                  label="Summary"
                  generating={aiSummaryLoading}
                  preview={aiSummaryPreview}
                  onApply={(summary) => {
                    setData({ ...data, summary })
                    setAiSummaryPreview(null)
                  }}
                  onCancel={() => setAiSummaryPreview(null)}
                />
              </CardContent>
            </Card>

            {/* Work Experience */}
            <Card id="section-experience" data-section="workExperience">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3">
                <CardTitle className="text-base sm:text-lg">Work Experience</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setData({
                      ...data,
                      workExperience: [
                        ...data.workExperience,
                        {
                          company: '',
                          position: '',
                          location: '',
                          startDate: '',
                          endDate: '',
                          current: false,
                          description: [],
                        },
                      ],
                    })
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.workExperience.map((exp, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">Experience #{idx + 1}</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setData({
                            ...data,
                            workExperience: data.workExperience.filter((_, i) => i !== idx),
                          })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...data.workExperience]
                            updated[idx].company = e.target.value
                            setData({ ...data, workExperience: updated })
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Position</Label>
                        <SuggestInput
                          value={exp.position}
                          onChange={(val) => {
                            const updated = [...data.workExperience]
                            updated[idx].position = val
                            setData({ ...data, workExperience: updated })
                          }}
                          suggestions={JOB_TITLES}
                          placeholder="e.g., Software Engineer"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Location</Label>
                        <SuggestInput
                          value={exp.location || ''}
                          onChange={(val) => {
                            const updated = [...data.workExperience]
                            updated[idx].location = val
                            setData({ ...data, workExperience: updated })
                          }}
                          suggestions={UAE_LOCATIONS}
                          placeholder="City, Country"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Start Date</Label>
                        <Input
                          type="month"
                          value={exp.startDate || ''}
                          onChange={(e) => {
                            const updated = [...data.workExperience]
                            updated[idx].startDate = e.target.value
                            setData({ ...data, workExperience: updated })
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">End Date</Label>
                        <Input
                          type="month"
                          value={exp.endDate || ''}
                          onChange={(e) => {
                            const updated = [...data.workExperience]
                            updated[idx].endDate = e.target.value
                            setData({ ...data, workExperience: updated })
                          }}
                          disabled={exp.current}
                          placeholder={exp.current ? 'Present' : ''}
                        />
                      </div>
                      <div className="space-y-1 flex items-end">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`current-${idx}`}
                            checked={exp.current || false}
                            onChange={(e) => {
                              const updated = [...data.workExperience]
                              updated[idx].current = e.target.checked
                              if (e.target.checked) {
                                updated[idx].endDate = null
                              }
                              setData({ ...data, workExperience: updated })
                            }}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <Label htmlFor={`current-${idx}`} className="text-xs cursor-pointer">
                            Currently working here
                          </Label>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Description (one per line)</Label>
                        <AIButton
                          label="Improve with AI"
                          loading={aiExperienceLoading[idx] || false}
                          data-action={`improve-experience-${idx}`}
                          onClick={async () => {
                            if (!exp.company || !exp.position) {
                              alert('Please enter company and position first')
                              return
                            }
                            setAiExperienceLoading({ ...aiExperienceLoading, [idx]: true })
                            setAiExperiencePreviews({ ...aiExperiencePreviews, [idx]: [] })
                            try {
                              const response = await fetch('/api/ai/resume/experience', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  company: exp.company,
                                  position: exp.position,
                                  description: exp.description,
                                  jobTitle: exp.position,
                                  industry: '',
                                }),
                              })
                              if (response.ok) {
                                const result = await response.json()
                                setAiExperiencePreviews({ ...aiExperiencePreviews, [idx]: result.bullets })
                              } else {
                                const error = await response.json()
                                alert(error.error || 'Failed to optimize experience')
                              }
                            } catch (error) {
                              console.error('AI experience error:', error)
                              alert('Failed to optimize experience. Please try again.')
                            } finally {
                              setAiExperienceLoading({ ...aiExperienceLoading, [idx]: false })
                            }
                          }}
                        />
                      </div>
                      <textarea
                        className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={exp.description.join('\n')}
                        onChange={(e) => {
                          const updated = [...data.workExperience]
                          updated[idx].description = e.target.value.split('\n').filter(l => l.trim())
                          setData({ ...data, workExperience: updated })
                        }}
                        placeholder="Enter bullet points, one per line"
                      />
                      {aiExperiencePreviews[idx] && aiExperiencePreviews[idx].length > 0 && (
                        <AIAssistant
                          label="Experience Bullets"
                          generating={false}
                          preview={aiExperiencePreviews[idx].join('\n')}
                          onApply={(bullets) => {
                            const updated = [...data.workExperience]
                            updated[idx].description = bullets.split('\n').filter(l => l.trim())
                            setData({ ...data, workExperience: updated })
                            setAiExperiencePreviews({ ...aiExperiencePreviews, [idx]: [] })
                          }}
                          onCancel={() => {
                            setAiExperiencePreviews({ ...aiExperiencePreviews, [idx]: [] })
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
                {data.workExperience.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No work experience added yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card id="section-skills" data-section="skills">
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Skills</CardTitle>
                <div className="flex gap-2">
                  <AIButton
                    label="Suggest Skills"
                    loading={aiSkillsLoading}
                    onClick={async () => {
                      setAiSkillsLoading(true)
                      setAiSkillsPreview(null)
                      try {
                        const response = await fetch('/api/ai/resume/skills', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            jobTitle: data.workExperience[0]?.position || '',
                            industry: '',
                            currentSkills: data.skills.flatMap(s => s.items || []),
                            experienceLevel: data.workExperience.length > 5 ? 'senior' : 'mid',
                          }),
                        })
                        if (response.ok) {
                          const result = await response.json()
                          setAiSkillsPreview(result.skills)
                        } else {
                          const error = await response.json()
                          alert(error.error || 'Failed to suggest skills')
                        }
                      } catch (error) {
                        console.error('AI skills error:', error)
                        alert('Failed to suggest skills. Please try again.')
                      } finally {
                        setAiSkillsLoading(false)
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setData({
                        ...data,
                        skills: [
                          ...data.skills,
                          { category: 'Technical Skills', items: [] },
                        ],
                      })
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiSkillsPreview && aiSkillsPreview.length > 0 && (
                  <AIAssistant
                    label="Skills"
                    generating={false}
                    preview={aiSkillsPreview.join(', ')}
                    onApply={(skillsText) => {
                      const skillsList = skillsText.split(',').map(s => s.trim()).filter(s => s)
                      setData({
                        ...data,
                        skills: [
                          { category: 'Skills', items: skillsList },
                        ],
                      })
                      setAiSkillsPreview(null)
                    }}
                    onCancel={() => setAiSkillsPreview(null)}
                  />
                )}
                {data.skills.map((skillGroup, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Category (e.g., Technical Skills)"
                          value={skillGroup.category}
                          onChange={(e) => {
                            const updated = [...data.skills]
                            updated[idx].category = e.target.value
                            setData({ ...data, skills: updated })
                          }}
                        />
                        <SkillTagInput
                          value={skillGroup.items || []}
                          onChange={(items) => {
                            const updated = [...data.skills]
                            updated[idx].items = items
                            setData({ ...data, skills: updated })
                          }}
                          placeholder="Type a skill and press Enter…"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setData({
                            ...data,
                            skills: data.skills.filter((_, i) => i !== idx),
                          })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {data.skills.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No skills added yet. Click &quot;Suggest Skills&quot; to get AI suggestions.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card id="section-education" data-section="education">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3">
                <CardTitle className="text-base sm:text-lg">Education</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setData({
                      ...data,
                      education: [
                        ...data.education,
                        {
                          institution: '',
                          degree: '',
                          field: '',
                          startDate: '',
                          endDate: '',
                        },
                      ],
                    })
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.education.map((edu, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">Education #{idx + 1}</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setData({
                            ...data,
                            education: data.education.filter((_, i) => i !== idx),
                          })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Institution</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = [...data.education]
                            updated[idx].institution = e.target.value
                            setData({ ...data, education: updated })
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...data.education]
                            updated[idx].degree = e.target.value
                            setData({ ...data, education: updated })
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Field of Study</Label>
                        <SuggestInput
                          value={edu.field || ''}
                          onChange={(val) => {
                            const updated = [...data.education]
                            updated[idx].field = val
                            setData({ ...data, education: updated })
                          }}
                          suggestions={EDUCATION_FIELDS}
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">GPA (Optional)</Label>
                        <Input
                          value={edu.gpa || ''}
                          onChange={(e) => {
                            const updated = [...data.education]
                            updated[idx].gpa = e.target.value
                            setData({ ...data, education: updated })
                          }}
                          placeholder="e.g., 3.8/4.0"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Start Date</Label>
                        <Input
                          type="month"
                          value={edu.startDate || ''}
                          onChange={(e) => {
                            const updated = [...data.education]
                            updated[idx].startDate = e.target.value
                            setData({ ...data, education: updated })
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">End Date</Label>
                        <Input
                          type="month"
                          value={edu.endDate || ''}
                          onChange={(e) => {
                            const updated = [...data.education]
                            updated[idx].endDate = e.target.value
                            setData({ ...data, education: updated })
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Finalize — Additional Sections */}
            <Card id="section-finalize">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Additional Sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500">Add certifications, languages, or other details to strengthen your resume.</p>

                {/* Certifications */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-sm">Certifications</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => {
                        const certs = data.certifications || []
                        setData({
                          ...data,
                          certifications: [...certs, { name: '', issuer: '', date: '' }],
                        })
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  {(data.certifications || []).map((cert, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Input
                          placeholder="Certification name"
                          value={cert.name || ''}
                          onChange={(e) => {
                            const updated = [...(data.certifications || [])]
                            updated[idx] = { ...updated[idx], name: e.target.value }
                            setData({ ...data, certifications: updated })
                          }}
                          className="text-sm"
                        />
                        <Input
                          placeholder="Issuer"
                          value={cert.issuer || ''}
                          onChange={(e) => {
                            const updated = [...(data.certifications || [])]
                            updated[idx] = { ...updated[idx], issuer: e.target.value }
                            setData({ ...data, certifications: updated })
                          }}
                          className="text-sm"
                        />
                        <Input
                          type="month"
                          value={cert.date || ''}
                          onChange={(e) => {
                            const updated = [...(data.certifications || [])]
                            updated[idx] = { ...updated[idx], date: e.target.value }
                            setData({ ...data, certifications: updated })
                          }}
                          className="text-sm"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          const updated = (data.certifications || []).filter((_, i) => i !== idx)
                          setData({ ...data, certifications: updated })
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Languages */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-sm">Languages</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => {
                        const langs = data.languages || []
                        setData({
                          ...data,
                          languages: [...langs, { language: '', proficiency: 'Intermediate' }],
                        })
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  {(data.languages || []).map((lang, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        placeholder="Language"
                        value={lang.language || ''}
                        onChange={(e) => {
                          const updated = [...(data.languages || [])]
                          updated[idx] = { ...updated[idx], language: e.target.value }
                          setData({ ...data, languages: updated })
                        }}
                        className="flex-1 text-sm"
                      />
                      <select
                        value={lang.proficiency || 'Intermediate'}
                        onChange={(e) => {
                          const updated = [...(data.languages || [])]
                          updated[idx] = { ...updated[idx], proficiency: e.target.value }
                          setData({ ...data, languages: updated })
                        }}
                        className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="Native">Native</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Basic">Basic</option>
                      </select>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          const updated = (data.languages || []).filter((_, i) => i !== idx)
                          setData({ ...data, languages: updated })
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customization Panel */}
            <CustomizationPanel
              customization={data.customization ? { ...defaultCustomization, ...data.customization } : defaultCustomization}
              onChange={(customization) => {
                setData({ ...data, customization })
              }}
              onReset={() => {
                setData({ ...data, customization: undefined })
              }}
            />

            {/* ATS Optimizer */}
            <ATSOptimizer 
              resume={data}
              onApplySuggestion={(suggestion, missingKeywords) => {
                handleApplyATSSuggestion(suggestion, missingKeywords)
              }}
            />
          </div>

          {/* Preview Section */}
          <div className="lg:sticky lg:top-8 h-fit order-1 lg:order-2 mb-4 lg:mb-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">Live Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 lg:p-6">
                <div className="bg-gray-100 p-2 sm:p-4 rounded-lg overflow-x-auto -mx-2 sm:mx-0">
                  <div className="min-w-0">
                    <ResumePreview
                      data={data}
                      templateKey={resume?.template?.metadata ? (resume.template.metadata as any)?.templateKey : null}
                      supportsPhoto={resume?.template?.supportsPhoto || false}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* PDF Preview Dialog */}
      <PDFPreviewDialog
        open={pdfPreviewOpen}
        onClose={() => setPdfPreviewOpen(false)}
        onDownload={() => handleDownload('a4')}
        resumeData={data}
        templateKey={resume?.template?.metadata ? (resume.template.metadata as any)?.templateKey : null}
        supportsPhoto={resume?.template?.supportsPhoto || false}
        resumeTitle={resume?.title || 'resume'}
      />

      {/* Tailor Resume Dialog */}
      <TailorResumeDialog
        open={tailorDialogOpen}
        onClose={() => setTailorDialogOpen(false)}
        loading={tailoring}
        onConfirm={async (jobTitle, jobDescription) => {
          setTailoring(true)
          try {
            const response = await fetch('/api/ai/resume/tailor', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jobTitle,
                jobDescription,
                currentResume: data,
              }),
            })
            if (response.ok) {
              const result = await response.json()
              if (window.confirm('Apply AI-tailored improvements to your resume?')) {
                const tailored = result.tailored || {}
                
                // Safely merge tailored data, ensuring proper structure
                const updatedData = { ...data }
                
                if (tailored.summary) {
                  updatedData.summary = tailored.summary
                }
                
                if (tailored.workExperience && Array.isArray(tailored.workExperience)) {
                  updatedData.workExperience = tailored.workExperience
                }
                
                // Ensure skills have proper structure: { category: string, items: string[] }
                if (tailored.skills && Array.isArray(tailored.skills)) {
                  updatedData.skills = tailored.skills.map((skill: any) => ({
                    category: skill.category || 'Skills',
                    items: Array.isArray(skill.items) ? skill.items : []
                  }))
                }
                
                setData(updatedData)
                setTailorDialogOpen(false)
                alert('Resume tailored successfully!')
              }
            } else {
              const error = await response.json()
              alert(error.error || 'Failed to tailor resume')
            }
          } catch (error) {
            console.error('Tailor error:', error)
            alert('Failed to tailor resume. Please try again.')
          } finally {
            setTailoring(false)
          }
        }}
      />
    </div>
  )
}

