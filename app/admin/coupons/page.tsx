'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Navbar } from '@/components/shared/Navbar'
import { Badge } from '@/components/ui/badge'
import { Tag, Plus, ToggleLeft, ToggleRight, Trash2, ArrowLeft, Check, X } from 'lucide-react'
import Link from 'next/link'

interface Coupon {
  id: string
  code: string
  description: string | null
  discountType: 'percent' | 'fixed'
  discountValue: number
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  isActive: boolean
  applicableTo: string[]
  minAmountFils: number | null
  createdAt: string
  _count?: { usages: number }
}

const PLAN_OPTIONS = [
  { value: 'all', label: 'All Plans' },
  { value: 'starter', label: 'Starter Bundle' },
  { value: 'pro', label: 'Pro Bundle' },
  { value: 'pro_annual', label: 'Pro Annual' },
  { value: 'automation', label: 'Automation' },
  { value: 'growth', label: 'Growth Bundle' },
]

const defaultForm = {
  code: '',
  description: '',
  discountType: 'percent' as 'percent' | 'fixed',
  discountValue: '',
  maxUses: '',
  expiresAt: '',
  applicableTo: ['all'] as string[],
  minAmountFils: '',
}

export default function AdminCouponsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/login'); return }
    if (status === 'authenticated' && session?.user?.role !== 'admin') { router.push('/dashboard'); return }
    if (status === 'authenticated') fetchCoupons()
  }, [status, session, router])

  const fetchCoupons = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/coupons')
      if (res.ok) setCoupons(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        code: form.code.toUpperCase(),
        description: form.description || undefined,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        applicableTo: form.applicableTo,
      }
      if (form.maxUses) body.maxUses = Number(form.maxUses)
      if (form.expiresAt) body.expiresAt = form.expiresAt
      if (form.minAmountFils) body.minAmountFils = Number(form.minAmountFils) * 100 // AED → fils

      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Failed to create coupon')
        return
      }
      setSuccessMsg('Coupon created!')
      setForm(defaultForm)
      setShowForm(false)
      fetchCoupons()
      setTimeout(() => setSuccessMsg(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    await fetch(`/api/admin/coupons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    fetchCoupons()
  }

  const deleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Deactivate coupon "${code}"? Usage history is preserved.`)) return
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    fetchCoupons()
  }

  const togglePlan = (value: string) => {
    if (value === 'all') {
      setForm((f) => ({ ...f, applicableTo: ['all'] }))
      return
    }
    setForm((f) => {
      const without = f.applicableTo.filter((v) => v !== 'all')
      const has = without.includes(value)
      const next = has ? without.filter((v) => v !== value) : [...without, value]
      return { ...f, applicableTo: next.length === 0 ? ['all'] : next }
    })
  }

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Skeleton className="h-9 w-48 mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Tag className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-bold">Coupon Codes</h1>
          <div className="ml-auto flex items-center gap-3">
            {successMsg && (
              <span className="text-sm text-emerald-600 flex items-center gap-1">
                <Check className="h-4 w-4" /> {successMsg}
              </span>
            )}
            <Button onClick={() => { setShowForm((v) => !v); setError(null) }} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Coupon
            </Button>
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <Card className="mb-6 border-emerald-200">
            <CardHeader>
              <CardTitle className="text-base">Create Coupon</CardTitle>
              <CardDescription>Discount codes can be percent-off or fixed AED amount.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Code *</Label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. WELCOME50"
                    required
                    className="font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Description</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="50% launch discount"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Discount Type *</Label>
                  <div className="flex gap-2">
                    {(['percent', 'fixed'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, discountType: t }))}
                        className={`flex-1 py-2 rounded-md border text-sm font-medium transition-colors ${
                          form.discountType === t
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {t === 'percent' ? 'Percent (%)' : 'Fixed (AED)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>
                    Discount Value *{' '}
                    <span className="text-muted-foreground font-normal">
                      ({form.discountType === 'percent' ? '0–100 %' : 'AED amount'})
                    </span>
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={form.discountType === 'percent' ? 100 : undefined}
                    step={form.discountType === 'percent' ? 1 : 0.01}
                    value={form.discountValue}
                    onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                    placeholder={form.discountType === 'percent' ? '50' : '5.00'}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label>Max Uses <span className="text-muted-foreground font-normal">(blank = unlimited)</span></Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.maxUses}
                    onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                    placeholder="100"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Expires At <span className="text-muted-foreground font-normal">(blank = never)</span></Label>
                  <Input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Min Order (AED) <span className="text-muted-foreground font-normal">(blank = none)</span></Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.minAmountFils}
                    onChange={(e) => setForm((f) => ({ ...f, minAmountFils: e.target.value }))}
                    placeholder="5.00"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label>Applicable Plans</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {PLAN_OPTIONS.map((p) => {
                      const selected = form.applicableTo.includes(p.value)
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => togglePlan(p.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                            selected
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {p.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {error && (
                  <p className="sm:col-span-2 text-sm text-red-600 flex items-center gap-1">
                    <X className="h-4 w-4" /> {error}
                  </p>
                )}

                <div className="sm:col-span-2 flex gap-3">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Creating...' : 'Create Coupon'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setError(null) }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Coupons List */}
        <div className="space-y-3">
          {coupons.length === 0 && !loading ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Tag className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No coupons yet</p>
                <p className="text-sm mt-1">Create your first coupon code above.</p>
              </CardContent>
            </Card>
          ) : (
            coupons.map((c) => (
              <Card key={c.id} className={!c.isActive ? 'opacity-60' : ''}>
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <code className="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono font-bold tracking-wider">
                        {c.code}
                      </code>
                      <Badge variant={c.isActive ? 'default' : 'secondary'} className="text-xs shrink-0">
                        {c.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm min-w-0 flex-1">
                      <span className="font-semibold text-emerald-700">
                        {c.discountType === 'percent'
                          ? `${c.discountValue}% off`
                          : `${(c.discountValue / 100).toFixed(2)} AED off`}
                      </span>
                      {c.description && (
                        <span className="text-muted-foreground truncate">{c.description}</span>
                      )}
                      <span className="text-muted-foreground text-xs shrink-0">
                        Used {c.usedCount}{c.maxUses ? `/${c.maxUses}` : ''} times
                      </span>
                      {c.expiresAt && (
                        <span className="text-muted-foreground text-xs shrink-0">
                          Expires {new Date(c.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                      {c.applicableTo.length > 0 && !c.applicableTo.includes('all') && (
                        <span className="text-muted-foreground text-xs">
                          Plans: {c.applicableTo.join(', ')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleActive(c.id, c.isActive)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title={c.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {c.isActive
                          ? <ToggleRight className="h-6 w-6 text-emerald-600" />
                          : <ToggleLeft className="h-6 w-6" />}
                      </button>
                      <button
                        onClick={() => deleteCoupon(c.id, c.code)}
                        className="text-muted-foreground hover:text-red-600 transition-colors"
                        title="Deactivate & archive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
