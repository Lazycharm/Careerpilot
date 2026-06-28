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
import { Mail, Plus, Send, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Campaign {
  id: string
  name: string
  subject: string
  status: string
  sentCount: number
  failedCount: number
  scheduledFor: string | null
  sentAt: string | null
  createdAt: string
}

const statusBadge: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  scheduled: 'outline',
  sending: 'default',
  sent: 'default',
  paused: 'secondary',
  failed: 'destructive',
}

export default function AdminEmailCampaignsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState<string | null>(null)

  const [formName, setFormName] = useState('')
  const [formSubject, setFormSubject] = useState('')
  const [formBody, setFormBody] = useState('')
  const [formSegment, setFormSegment] = useState('allUsers')

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') fetchCampaigns()
    else if (status === 'authenticated') router.push('/dashboard')
    else if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, session])

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/admin/email-campaigns')
      if (res.ok) {
        const data = await res.json()
        setCampaigns(Array.isArray(data) ? data : data.items || data.campaigns || [])
      }
    } catch (err) {
      console.error('Failed to fetch campaigns:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formName.trim() || !formSubject.trim() || !formBody.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/email-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          subject: formSubject.trim(),
          bodyHtml: formBody.trim(),
          segmentRule: { type: formSegment },
        }),
      })
      if (res.ok) {
        setShowForm(false)
        setFormName(''); setFormSubject(''); setFormBody(''); setFormSegment('allUsers')
        fetchCampaigns()
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to create campaign')
      }
    } catch { alert('Failed to create campaign') }
    finally { setSaving(false) }
  }

  const handleSend = async (id: string) => {
    if (!confirm('Send this campaign now? This cannot be undone.')) return
    setSending(id)
    try {
      const res = await fetch(`/api/admin/email-campaigns/${id}/send`, { method: 'POST' })
      if (res.ok) {
        alert('Campaign is being sent!')
        fetchCampaigns()
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to send')
      }
    } catch { alert('Failed to send campaign') }
    finally { setSending(null) }
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
            <Mail className="h-7 w-7" /> Email Campaigns
          </h1>
          <Button onClick={() => setShowForm(true)} className="gap-2 min-h-[44px]">
            <Plus className="h-4 w-4" /> New Campaign
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6 border-primary/30">
            <CardHeader className="pb-3"><CardTitle className="text-base">Create Campaign</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Campaign Name</Label>
                  <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g., June Newsletter" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Subject Line</Label>
                  <Input value={formSubject} onChange={e => setFormSubject(e.target.value)} placeholder="e.g., New features are here!" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Audience Segment</Label>
                <select value={formSegment} onChange={e => setFormSegment(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="allUsers">All Users</option>
                  <option value="hasActiveSubscription">Active Subscribers</option>
                  <option value="freeUsers">Free Users</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email Body (HTML)</Label>
                <textarea
                  value={formBody}
                  onChange={e => setFormBody(e.target.value)}
                  placeholder="<h1>Hello!</h1><p>Your email content here...</p>"
                  className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={saving || !formName.trim() || !formSubject.trim() || !formBody.trim()}>
                  {saving ? 'Creating...' : 'Create Campaign'}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {campaigns.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              No campaigns yet. Create your first email campaign.
            </CardContent></Card>
          ) : campaigns.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm truncate">{c.name}</span>
                      <Badge variant={statusBadge[c.status] || 'secondary'} className="text-[10px]">{c.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">Subject: {c.subject}</p>
                    <div className="flex gap-3 mt-1 text-xs text-gray-400">
                      <span>Sent: {c.sentCount}</span>
                      {c.failedCount > 0 && <span className="text-red-500">Failed: {c.failedCount}</span>}
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {c.status === 'draft' && (
                    <Button size="sm" className="gap-1 h-8" onClick={() => handleSend(c.id)} disabled={sending === c.id}>
                      <Send className="h-3 w-3" />
                      {sending === c.id ? 'Sending...' : 'Send Now'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
