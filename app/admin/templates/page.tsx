'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/shared/Navbar'
import { TemplateMiniPreview } from '@/components/resume/TemplateMiniPreview'
import { Plus, Pencil, Trash2, Eye, EyeOff, LayoutTemplate, ArrowLeft } from 'lucide-react'
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

export default function AdminTemplatesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('modern')
  const [formPreviewImage, setFormPreviewImage] = useState('')
  const [formSupportsPhoto, setFormSupportsPhoto] = useState(false)
  const [formIsPremium, setFormIsPremium] = useState(false)
  const [formTemplateKey, setFormTemplateKey] = useState('')
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

  const resetForm = () => {
    setFormName('')
    setFormCategory('modern')
    setFormPreviewImage('')
    setFormSupportsPhoto(false)
    setFormIsPremium(false)
    setFormTemplateKey('')
    setEditingId(null)
    setShowForm(false)
  }

  const startEdit = (t: Template) => {
    setFormName(t.name)
    setFormCategory(t.category || 'modern')
    setFormPreviewImage(t.previewImage || '')
    setFormSupportsPhoto(t.supportsPhoto)
    setFormIsPremium(t.isPremium)
    setFormTemplateKey((t.metadata as any)?.templateKey || '')
    setEditingId(t.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!formName.trim()) return
    setSaving(true)
    try {
      const body = {
        name: formName.trim(),
        category: formCategory,
        previewImage: formPreviewImage.trim() || null,
        supportsPhoto: formSupportsPhoto,
        isPremium: formIsPremium,
        metadata: { templateKey: formTemplateKey || formName.toLowerCase().replace(/\s+/g, '-') },
      }

      const url = editingId ? `/api/admin/templates/${editingId}` : '/api/admin/templates'
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        resetForm()
        fetchTemplates()
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to save template')
      }
    } catch {
      alert('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (res.ok) fetchTemplates()
    } catch {
      alert('Failed to update template')
    }
  }

  const handleDelete = async (id: string, name: string, count: number) => {
    if (count > 0) {
      alert(`Cannot delete "${name}" — ${count} resume(s) use it. Deactivate it instead.`)
      return
    }
    if (!confirm(`Delete template "${name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/admin/templates/${id}`, { method: 'DELETE' })
      if (res.ok) fetchTemplates()
      else {
        const err = await res.json()
        alert(err.error || 'Failed to delete')
      }
    } catch {
      alert('Failed to delete template')
    }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Link href="/admin" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-4 gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Admin
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <LayoutTemplate className="h-7 w-7" /> Resume Templates
          </h1>
          <Button onClick={() => { resetForm(); setShowForm(true) }} className="gap-2 min-h-[44px]">
            <Plus className="h-4 w-4" /> Add Template
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="mb-6 border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{editingId ? 'Edit Template' : 'Add New Template'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Template Name</Label>
                  <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g., Ocean Blue" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Category</Label>
                  <select value={formCategory} onChange={e => setFormCategory(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                    <option value="creative">Creative</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Preview Image URL</Label>
                  <Input value={formPreviewImage} onChange={e => setFormPreviewImage(e.target.value)} placeholder="https://... or leave empty for auto-preview" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Template Style Key</Label>
                  <Input value={formTemplateKey} onChange={e => setFormTemplateKey(e.target.value)} placeholder="e.g., ocean-blue (maps to templateStyles.ts)" />
                </div>
              </div>
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
                  {saving ? 'Saving...' : editingId ? 'Update Template' : 'Create Template'}
                </Button>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {templates.map((t) => (
            <Card key={t.id} className={!t.isActive ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="mb-3">
                  <TemplateMiniPreview name={t.name} category={t.category || 'modern'} supportsPhoto={t.supportsPhoto} />
                </div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{t.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant={t.isActive ? 'default' : 'secondary'} className="text-[10px]">
                        {t.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {t.isPremium && <Badge variant="outline" className="text-[10px]">Premium</Badge>}
                      <span className="text-[10px] text-gray-400 capitalize">{t.category}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3">{t._count.resumes} resume(s) using this</p>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => startEdit(t)}>
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleToggleActive(t.id, t.isActive)}>
                    {t.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs text-red-500 hover:text-red-700" onClick={() => handleDelete(t.id, t.name, t._count.resumes)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <LayoutTemplate className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No templates yet. Add your first one or seed the defaults from the admin dashboard.</p>
          </div>
        )}
      </div>
    </div>
  )
}
