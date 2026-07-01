'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'
import { Save, Download, Sparkles, TrendingUp, Minus, Plus, Eye, LayoutTemplate } from 'lucide-react'
import { CoverLetterPreview } from '@/components/coverLetter/CoverLetterPreview'
import { listCLTemplates } from '@/lib/coverLetter/templates/registry'
import type { CoverLetterData } from '@/lib/coverLetter/templates/types'

const TEMPLATES = listCLTemplates()

export default function CoverLetterViewPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const letterId = params.id as string

  const [coverLetter, setCoverLetter] = useState<any>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customizing, setCustomizing] = useState<string | null>(null)
  const [templateKey, setTemplateKey] = useState('classic')
  const [showPreview, setShowPreview] = useState(true)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)

  useEffect(() => { if (letterId) fetchCoverLetter() }, [letterId])

  const fetchCoverLetter = async () => {
    try {
      const res = await fetch(`/api/cover-letters/${letterId}`)
      if (res.ok) {
        const data = await res.json()
        setCoverLetter(data)
        setContent(data.content)
      }
    } catch (e) {
      console.error('Failed to fetch cover letter', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/cover-letters/${letterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error()
    } catch {
      alert('Failed to save cover letter')
    } finally {
      setSaving(false)
    }
  }

  const handleCustomize = async (action: 'improve' | 'shorten' | 'elongate') => {
    setCustomizing(action)
    try {
      const res = await fetch(`/api/cover-letters/${letterId}/customize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        const data = await res.json()
        setContent(data.content)
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to customize cover letter')
      }
    } catch {
      alert('Failed to customize cover letter')
    } finally {
      setCustomizing(null)
    }
  }

  const handleDownload = async () => {
    try {
      const res = await fetch(`/api/cover-letters/${letterId}/export?template=${templateKey}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to generate PDF' }))
        alert(err.error || 'Failed to download PDF')
        return
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cover-letter-${coverLetter?.jobTitle || 'letter'}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      alert('Failed to download cover letter')
    }
  }

  const previewData: CoverLetterData = {
    content,
    jobTitle: coverLetter?.jobTitle,
    companyName: coverLetter?.companyName,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{coverLetter?.jobTitle || 'Cover Letter'}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{coverLetter?.industry}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} className="gap-1.5">
              <Eye className="h-4 w-4" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <Button size="sm" onClick={handleDownload} className="gap-1.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 border-0">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* Editor column */}
          <div className="flex-1 space-y-4 min-w-0">
            {/* AI Tools */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                  AI Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2 flex-wrap">
                {[
                  { action: 'improve' as const, label: 'Improve', icon: TrendingUp },
                  { action: 'shorten' as const, label: 'Shorten', icon: Minus },
                  { action: 'elongate' as const, label: 'Expand', icon: Plus },
                ].map(({ action, label, icon: Icon }) => (
                  <Button
                    key={action}
                    variant="outline"
                    size="sm"
                    onClick={() => handleCustomize(action)}
                    disabled={customizing !== null}
                    className="gap-1.5 flex-1 min-w-[100px]"
                  >
                    {customizing === action ? (
                      <Sparkles className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                    {customizing === action ? `${label}ing…` : label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Template Selector */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <LayoutTemplate className="h-4 w-4 text-blue-600" />
                    Template — {TEMPLATES.find((t) => t.key === templateKey)?.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                  >
                    {showTemplateSelector ? 'Close' : 'Change'}
                  </Button>
                </div>
              </CardHeader>
              {showTemplateSelector && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.key}
                        onClick={() => { setTemplateKey(t.key); setShowTemplateSelector(false) }}
                        className={`rounded-lg border-2 p-2.5 text-left transition-all ${
                          templateKey === t.key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div
                          className="w-full h-1.5 rounded-full mb-1.5"
                          style={{ background: t.accentColor }}
                        />
                        <p className="text-xs font-semibold text-gray-900 leading-tight">{t.name}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-tight line-clamp-2">{t.description}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Text editor */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Edit Content</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full min-h-[500px] rounded-md border border-input bg-background px-4 py-3 text-sm font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Cover letter content…"
                />
              </CardContent>
            </Card>
          </div>

          {/* Live Preview column */}
          {showPreview && (
            <div className="xl:w-[420px] flex-shrink-0">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Live Preview</p>
                  <p className="text-[10px] text-gray-400">Matches your PDF output</p>
                </div>
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-lg bg-white">
                  <CoverLetterPreview data={previewData} templateKey={templateKey} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
