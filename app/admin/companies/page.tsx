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
import { Building2, Plus, Pencil, Trash2, Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Company {
  id: string
  name: string
  slug: string
  industry: string | null
  category: string | null
  hqCity: string | null
  hqCountry: string
  website: string | null
  isActive: boolean
  createdAt: string
}

export default function AdminCompaniesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [formName, setFormName] = useState('')
  const [formIndustry, setFormIndustry] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formCity, setFormCity] = useState('')
  const [formWebsite, setFormWebsite] = useState('')

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') fetchCompanies()
    else if (status === 'authenticated') router.push('/dashboard')
    else if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, session])

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/admin/companies')
      if (res.ok) {
        const data = await res.json()
        setCompanies(Array.isArray(data) ? data : data.items || data.companies || [])
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormName(''); setFormIndustry(''); setFormCategory(''); setFormCity(''); setFormWebsite('')
    setEditingId(null); setShowForm(false)
  }

  const startEdit = (c: Company) => {
    setFormName(c.name); setFormIndustry(c.industry || ''); setFormCategory(c.category || '')
    setFormCity(c.hqCity || ''); setFormWebsite(c.website || '')
    setEditingId(c.id); setShowForm(true)
  }

  const handleSave = async () => {
    if (!formName.trim()) return
    setSaving(true)
    try {
      const body = {
        name: formName.trim(),
        industry: formIndustry.trim() || null,
        category: formCategory.trim() || null,
        hqCity: formCity.trim() || null,
        website: formWebsite.trim() || null,
      }
      const url = editingId ? `/api/admin/companies/${editingId}` : '/api/admin/companies'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) { resetForm(); fetchCompanies() }
      else { const err = await res.json(); alert(err.error || 'Failed to save') }
    } catch { alert('Failed to save company') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/admin/companies/${id}`, { method: 'DELETE' })
      if (res.ok) fetchCompanies()
      else { const err = await res.json(); alert(err.error || 'Failed to delete') }
    } catch { alert('Failed to delete') }
  }

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry || '').toLowerCase().includes(search.toLowerCase())
  )

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
            <Building2 className="h-7 w-7" /> Companies ({companies.length})
          </h1>
          <Button onClick={() => { resetForm(); setShowForm(true) }} className="gap-2 min-h-[44px]">
            <Plus className="h-4 w-4" /> Add Company
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6 border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{editingId ? 'Edit Company' : 'Add New Company'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Company Name *</Label>
                  <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g., Emirates NBD" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Industry</Label>
                  <Input value={formIndustry} onChange={e => setFormIndustry(e.target.value)} placeholder="e.g., Banking" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Category</Label>
                  <Input value={formCategory} onChange={e => setFormCategory(e.target.value)} placeholder="e.g., retail, tech, hospitality" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">HQ City</Label>
                  <Input value={formCity} onChange={e => setFormCity(e.target.value)} placeholder="e.g., Dubai" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Website</Label>
                  <Input value={formWebsite} onChange={e => setFormWebsite(e.target.value)} placeholder="https://..." />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving || !formName.trim()}>
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create Company'}
                </Button>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 text-xs font-medium text-gray-500">Name</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500">Industry</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500">City</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500">Status</th>
                    <th className="text-right p-3 text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium text-sm">{c.name}</div>
                        {c.website && <div className="text-xs text-gray-400 truncate max-w-[200px]">{c.website}</div>}
                      </td>
                      <td className="p-3 text-sm text-gray-600">{c.industry || '—'}</td>
                      <td className="p-3 text-sm text-gray-600">{c.hqCity || '—'}, {c.hqCountry}</td>
                      <td className="p-3">
                        <Badge variant={c.isActive ? 'default' : 'secondary'} className="text-[10px]">
                          {c.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => startEdit(c)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => handleDelete(c.id, c.name)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-sm text-gray-500">No companies found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
