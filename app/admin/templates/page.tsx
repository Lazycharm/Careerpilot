'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Navbar } from '@/components/shared/Navbar'
import { TemplateMiniPreview } from '@/components/resume/TemplateMiniPreview'
import { Plus, Pencil, Trash2, Eye, EyeOff, LayoutTemplate, ArrowLeft, Code2, Wand2, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface Template {
  id: string
  name: string
  category: string | null
  previewImage: string | null
  supportsPhoto: boolean
  isPremium: boolean
  isActive: boolean
  metadata: any
  createdAt: string
  _count: { resumes: number }
}

type Tab = 'all' | 'classic' | 'modern' | 'creative' | 'premium' | 'specialty' | 'ats'

const CATEGORIES: Tab[] = ['all', 'classic', 'modern', 'creative', 'premium', 'specialty', 'ats']

export default function AdminTemplatesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState<'basic' | 'html'>('basic')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState<string | null>(null)

  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('modern')
  const [formPreviewImage, setFormPreviewImage] = useState('')
  const [formSupportsPhoto, setFormSupportsPhoto] = useState(false)
  const [formIsPremium, setFormIsPremium] = useState(false)
  const [formTemplateKey, setFormTemplateKey] = useState('')
  const [formHtmlContent, setFormHtmlContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') fetchTemplates()
    else if (status === 'authenticated') router.push('/dashboard')
    else if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, session])

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.templates || [])
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSeed = async () => {
    setSeeding(true)
    setSeedMsg(null)
    try {
      const res = await fetch('/api/resumes/seed-templates', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setSeedMsg(`✅ ${data.count} templates synced from code registry`)
        fetchTemplates()
      } else {
        setSeedMsg(`❌ ${data.error || 'Seed failed'}`)
      }
    } catch {
      setSeedMsg('❌ Failed to seed templates')
    } finally {
      setSeeding(false)
    }
  }

  const resetForm = () => {
    setFormName(''); setFormCategory('modern'); setFormPreviewImage('')
    setFormSupportsPhoto(false); setFormIsPremium(false); setFormTemplateKey('')
    setFormHtmlContent(''); setEditingId(null); setShowForm(false); setFormMode('basic')
  }

  const startEdit = (t: Template) => {
    setFormName(t.name)
    setFormCategory(t.category || 'modern')
    setFormPreviewImage(t.previewImage || '')
    setFormSupportsPhoto(t.supportsPhoto)
    setFormIsPremium(t.isPremium)
    setFormTemplateKey((t.metadata as any)?.templateKey || '')
    setFormHtmlContent((t.metadata as any)?.htmlContent || '')
    setEditingId(t.id)
    setFormMode((t.metadata as any)?.htmlContent ? 'html' : 'basic')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = async () => {
    if (!formName.trim()) return
    setSaving(true)
    try {
      const meta: any = {
        templateKey: formTemplateKey || formName.toLowerCase().replace(/\s+/g, '-'),
      }
      if (formMode === 'html' && formHtmlContent.trim()) {
        meta.htmlContent = formHtmlContent.trim()
        meta.isHtmlTemplate = true
      }
      const body = {
        name: formName.trim(), category: formCategory,
        previewImage: formPreviewImage.trim() || null,
        supportsPhoto: formSupportsPhoto, isPremium: formIsPremium, metadata: meta,
      }
      const url = editingId ? `/api/admin/templates/${editingId}` : '/api/admin/templates'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { resetForm(); fetchTemplates() }
      else { const err = await res.json(); alert(err.error || 'Failed to save template') }
    } catch { alert('Failed to save template') }
    finally { setSaving(false) }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/templates/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      fetchTemplates()
    } catch { alert('Failed to update template') }
  }

  const handleDelete = async (id: string, name: string, count: number) => {
    if (count > 0) { alert(`Cannot delete "${name}" — ${count} resume(s) use it.`); return }
    if (!confirm(`Delete "${name}"?`)) return
    try {
      const res = await fetch(`/api/admin/templates/${id}`, { method: 'DELETE' })
      if (res.ok) fetchTemplates()
      else { const err = await res.json(); alert(err.error || 'Failed to delete') }
    } catch { alert('Failed to delete template') }
  }

  const filtered = activeTab === 'all'
    ? templates
    : templates.filter(t => (t.category || '') === activeTab)

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[8.5/11] rounded-md" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Link href="/admin" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-4 gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Admin
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <LayoutTemplate className="h-7 w-7" /> Resume Templates
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {templates.length} templates total · {templates.filter(t => t.isActive).length} active
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline" size="sm" onClick={handleSeed} disabled={seeding}
              className="gap-2 min-h-[40px]"
            >
              <RefreshCw className={`h-4 w-4 ${seeding ? 'animate-spin' : ''}`} />
              {seeding ? 'Syncing…' : 'Sync from Code'}
            </Button>
            <Button onClick={() => { resetForm(); setShowForm(true) }} className="gap-2 min-h-[40px]">
              <Plus className="h-4 w-4" /> Add Template
            </Button>
          </div>
        </div>

        {seedMsg && (
          <p className={`text-sm mb-4 font-medium ${seedMsg.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {seedMsg}
          </p>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="mb-6 border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{editingId ? 'Edit Template' : 'Add New Template'}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm" variant={formMode === 'basic' ? 'default' : 'outline'}
                    onClick={() => setFormMode('basic')} className="h-7 text-xs gap-1"
                  >
                    <Wand2 className="h-3 w-3" /> Basic
                  </Button>
                  <Button
                    size="sm" variant={formMode === 'html' ? 'default' : 'outline'}
                    onClick={() => setFormMode('html')} className="h-7 text-xs gap-1"
                  >
                    <Code2 className="h-3 w-3" /> HTML
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Template Name *</Label>
                  <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g., Ocean Blue" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Category</Label>
                  <select
                    value={formCategory} onChange={e => setFormCategory(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="classic">Classic</option>
                    <option value="modern">Modern</option>
                    <option value="creative">Creative</option>
                    <option value="premium">Premium</option>
                    <option value="specialty">Specialty</option>
                    <option value="ats">ATS-Optimized</option>
                    <option value="executive">Executive</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>
                {formMode === 'basic' && (
                  <div className="space-y-1">
                    <Label className="text-xs">Template Style Key</Label>
                    <Input
                      value={formTemplateKey} onChange={e => setFormTemplateKey(e.target.value)}
                      placeholder="e.g., dubai-classic (maps to code registry)"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-xs">Preview Image URL (optional)</Label>
                  <Input
                    value={formPreviewImage} onChange={e => setFormPreviewImage(e.target.value)}
                    placeholder="https://... or leave empty for auto-preview"
                  />
                </div>
              </div>

              {formMode === 'html' && (
                <div className="space-y-1">
                  <Label className="text-xs">HTML Template Code</Label>
                  <p className="text-xs text-gray-500 mb-1">
                    Paste your HTML/CSS. Use placeholders: <code className="bg-gray-100 px-1 rounded">{'{{fullName}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{email}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{phone}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{location}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{summary}}'}</code>
                  </p>
                  <textarea
                    value={formHtmlContent}
                    onChange={e => setFormHtmlContent(e.target.value)}
                    placeholder={`<!DOCTYPE html>\n<html>\n<head><style>\n  /* Your CSS here */\n</style></head>\n<body>\n  <h1>{{fullName}}</h1>\n  <p>{{email}} · {{phone}} · {{location}}</p>\n  <hr/>\n  <p>{{summary}}</p>\n</body>\n</html>`}
                    className="w-full h-64 rounded-md border border-input bg-background p-3 text-xs font-mono resize-y"
                    spellCheck={false}
                  />
                  {formHtmlContent && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1 font-medium">Live preview (sample data):</p>
                      <div className="border rounded-md overflow-hidden bg-white" style={{ height: '400px' }}>
                        <iframe
                          srcDoc={formHtmlContent
                            .replace(/\{\{fullName\}\}/g, 'Ahmed Al Rashid')
                            .replace(/\{\{email\}\}/g, 'ahmed@example.com')
                            .replace(/\{\{phone\}\}/g, '+971 50 123 4567')
                            .replace(/\{\{location\}\}/g, 'Dubai, UAE')
                            .replace(/\{\{summary\}\}/g, 'Experienced professional with 8 years in the UAE market...')
                          }
                          className="w-full h-full border-0"
                          title="Template Preview"
                          sandbox="allow-same-origin"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={formSupportsPhoto} onChange={e => setFormSupportsPhoto(e.target.checked)} className="h-4 w-4 rounded" />
                  Supports profile photo
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={formIsPremium} onChange={e => setFormIsPremium(e.target.checked)} className="h-4 w-4 rounded" />
                  Premium template
                </label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving || !formName.trim()}>
                  {saving ? 'Saving…' : editingId ? 'Update Template' : 'Create Template'}
                </Button>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1 -mx-4 px-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === cat
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat === 'all' ? `All (${templates.length})` : `${cat.charAt(0).toUpperCase() + cat.slice(1)} (${templates.filter(t => t.category === cat).length})`}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[8.5/11] rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filtered.map((t) => (
              <Card key={t.id} className={`overflow-hidden transition-opacity ${!t.isActive ? 'opacity-50' : ''}`}>
                <CardContent className="p-3">
                  <div className="mb-2.5">
                    <TemplateMiniPreview
                      name={t.name}
                      category={t.category || 'modern'}
                      templateKey={(t.metadata as any)?.templateKey}
                      supportsPhoto={t.supportsPhoto}
                    />
                  </div>
                  <h3 className="font-semibold text-xs leading-tight mb-1">{t.name}</h3>
                  <div className="flex items-center gap-1 flex-wrap mb-2">
                    <Badge variant={t.isActive ? 'default' : 'secondary'} className="text-[10px] h-4 px-1">
                      {t.isActive ? 'Active' : 'Off'}
                    </Badge>
                    {t.isPremium && <Badge variant="outline" className="text-[10px] h-4 px-1">Pro</Badge>}
                    {(t.metadata as any)?.isHtmlTemplate && <Badge variant="outline" className="text-[10px] h-4 px-1 border-blue-300 text-blue-600">HTML</Badge>}
                    <span className="text-[10px] text-gray-400 capitalize">{t.category}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-2">{t._count.resumes} resume(s)</p>
                  <div className="flex gap-1">
                    <Button
                      variant="outline" size="sm" className="h-6 text-[10px] flex-1 px-1"
                      onClick={() => startEdit(t)}
                    >
                      <Pencil className="h-2.5 w-2.5 mr-0.5" /> Edit
                    </Button>
                    <Button
                      variant="outline" size="sm" className="h-6 px-1.5"
                      onClick={() => handleToggleActive(t.id, t.isActive)}
                    >
                      {t.isActive ? <EyeOff className="h-2.5 w-2.5" /> : <Eye className="h-2.5 w-2.5" />}
                    </Button>
                    <Button
                      variant="outline" size="sm" className="h-6 px-1.5 text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(t.id, t.name, t._count.resumes)}
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <LayoutTemplate className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="mb-4">No templates in this category yet.</p>
            <Button onClick={handleSeed} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" /> Sync templates from code
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
