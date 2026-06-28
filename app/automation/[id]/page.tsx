'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/shared/Navbar'
import { ArrowLeft, Play, Pause, Trash2, Mail, Building2, Send, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface AutomationDetail {
  id: string
  name: string
  status: string
  generatePerCompany: boolean
  schedule: any
  nextRunAt: string | null
  lastRunAt: string | null
  startAt: string | null
  endAt: string | null
  createdAt: string
  emailAccount: { id: string; emailAddress: string; isActive: boolean }
  companies: { company: { id: string; name: string; industry: string | null } }[]
  runs: {
    id: string
    startedAt: string
    endedAt: string | null
    status: string
    applicationsSent: number
    errorSummary: string | null
  }[]
  applications: {
    id: string
    toEmail: string
    subject: string
    status: string
    sentAt: string | null
    errorMessage: string | null
    company: { name: string } | null
  }[]
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Active', variant: 'default' },
  paused: { label: 'Paused', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'outline' },
  errored: { label: 'Error', variant: 'destructive' },
}

const appStatusIcon: Record<string, React.ReactNode> = {
  sent: <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />,
  failed: <XCircle className="h-3.5 w-3.5 text-red-500" />,
  bounced: <AlertCircle className="h-3.5 w-3.5 text-amber-500" />,
  queued: <Clock className="h-3.5 w-3.5 text-gray-400" />,
  skipped: <XCircle className="h-3.5 w-3.5 text-gray-400" />,
}

export default function AutomationDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const automationId = params.id as string

  const [automation, setAutomation] = useState<AutomationDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (status === 'authenticated' && automationId) fetchDetail()
  }, [status, automationId])

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/automations/${automationId}`)
      if (res.ok) {
        const data = await res.json()
        setAutomation(data)
      } else if (res.status === 404) {
        router.push('/automation')
      }
    } catch (err) {
      console.error('Failed to fetch automation:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async () => {
    if (!automation) return
    const newStatus = automation.status === 'active' ? 'paused' : 'active'
    try {
      const res = await fetch(`/api/automations/${automationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) fetchDetail()
    } catch {
      alert('Failed to update')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this automation? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/automations/${automationId}`, { method: 'DELETE' })
      if (res.ok) router.push('/automation')
      else alert('Failed to delete')
    } catch {
      alert('Failed to delete')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (!automation) return null

  const sc = statusConfig[automation.status] || statusConfig.paused
  const schedule = automation.schedule as any

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link href="/automation" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-4 gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Automations
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{automation.name}</h1>
              <Badge variant={sc.variant}>{sc.label}</Badge>
            </div>
            <p className="text-sm text-gray-500">
              Created {new Date(automation.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            {(automation.status === 'active' || automation.status === 'paused') && (
              <Button variant="outline" size="sm" className="gap-1" onClick={handleToggle}>
                {automation.status === 'active' ? (
                  <><Pause className="h-4 w-4" /> Pause</>
                ) : (
                  <><Play className="h-4 w-4" /> Resume</>
                )}
              </Button>
            )}
            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 gap-1" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left — Details */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{automation.emailAccount.emailAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>Every {schedule?.cadenceMinutes || 30} min, {schedule?.startHour || 9}:00–{schedule?.endHour || 18}:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-gray-400" />
                  <span>Max {schedule?.dailyCap || 10}/day</span>
                </div>
                {automation.nextRunAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>Next run: {new Date(automation.nextRunAt).toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  Target Companies ({automation.companies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {automation.companies.map((ac) => (
                    <div key={ac.company.id} className="flex items-center justify-between text-sm py-1">
                      <span className="font-medium">{ac.company.name}</span>
                      {ac.company.industry && (
                        <span className="text-xs text-gray-400">{ac.company.industry}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right — Runs + Applications */}
          <div className="lg:col-span-2 space-y-4">
            {/* Run History */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Run History ({automation.runs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {automation.runs.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">No runs yet. The automation will execute at the next scheduled time.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {automation.runs.map((run) => (
                      <div key={run.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant={run.status === 'succeeded' ? 'default' : run.status === 'failed' ? 'destructive' : 'secondary'} className="text-[10px]">
                            {run.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(run.startedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{run.applicationsSent} sent</span>
                          {run.errorSummary && (
                            <span className="text-red-500 truncate max-w-[150px]" title={run.errorSummary}>
                              {run.errorSummary}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Application Log */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Applications Sent ({automation.applications.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {automation.applications.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">No applications sent yet.</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {automation.applications.map((app) => (
                      <div key={app.id} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-start gap-2 min-w-0">
                          {appStatusIcon[app.status] || appStatusIcon.queued}
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {app.company?.name || app.toEmail}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{app.subject}</p>
                            {app.errorMessage && (
                              <p className="text-xs text-red-500 mt-0.5">{app.errorMessage}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <Badge variant={app.status === 'sent' ? 'default' : app.status === 'failed' ? 'destructive' : 'secondary'} className="text-[10px]">
                            {app.status}
                          </Badge>
                          {app.sentAt && (
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {new Date(app.sentAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
