'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'
import { Badge } from '@/components/ui/badge'
import { Zap, Plus, Mail, Play, Pause, Building2, Send, Clock } from 'lucide-react'

interface AutomationItem {
  id: string
  name: string
  status: string
  generatePerCompany: boolean
  schedule: any
  nextRunAt: string | null
  lastRunAt: string | null
  createdAt: string
  emailAccount: { id: string; emailAddress: string; isActive: boolean }
  _count: { companies: number; applications: number; runs: number }
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Active', variant: 'default' },
  paused: { label: 'Paused', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'outline' },
  errored: { label: 'Error', variant: 'destructive' },
}

export default function AutomationDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [automations, setAutomations] = useState<AutomationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (status === 'authenticated') fetchAutomations()
  }, [status])

  const fetchAutomations = async () => {
    try {
      const res = await fetch('/api/automations')
      if (res.ok) {
        const data = await res.json()
        setAutomations(data.items || [])
      }
    } catch (err) {
      console.error('Failed to fetch automations:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    try {
      const res = await fetch(`/api/automations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) fetchAutomations()
      else alert('Failed to update automation')
    } catch {
      alert('Failed to update automation')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Job Application Automation</h1>
            <p className="text-sm text-gray-600 mt-1">Automatically send tailored applications to target companies</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link href="/automation/email-accounts" className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full min-h-[44px] gap-2">
                <Mail className="h-4 w-4" />
                Email Accounts
              </Button>
            </Link>
            <Link href="/automation/new" className="flex-1 sm:flex-none">
              <Button className="w-full min-h-[44px] gap-2">
                <Plus className="h-4 w-4" />
                New Automation
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-gray-500">Total</span>
              </div>
              <p className="text-xl font-bold">{automations.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Play className="h-4 w-4 text-green-600" />
                <span className="text-xs text-gray-500">Active</span>
              </div>
              <p className="text-xl font-bold">{automations.filter(a => a.status === 'active').length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-purple-600" />
                <span className="text-xs text-gray-500">Companies</span>
              </div>
              <p className="text-xl font-bold">{automations.reduce((sum, a) => sum + a._count.companies, 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Send className="h-4 w-4 text-teal-600" />
                <span className="text-xs text-gray-500">Sent</span>
              </div>
              <p className="text-xl font-bold">{automations.reduce((sum, a) => sum + a._count.applications, 0)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Automation List */}
        {automations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 px-4">
              <Zap className="h-14 w-14 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No automations yet</h3>
              <p className="text-sm text-gray-600 mb-6 text-center max-w-sm">
                Create your first automation to start sending tailored job applications automatically.
              </p>
              <Link href="/automation/new">
                <Button className="min-h-[44px] gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Automation
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {automations.map((auto) => {
              const sc = statusConfig[auto.status] || statusConfig.paused
              return (
                <Card key={auto.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/automation/${auto.id}`} className="font-semibold text-sm hover:text-primary truncate">
                            {auto.name}
                          </Link>
                          <Badge variant={sc.variant} className="text-[10px] px-1.5 py-0">
                            {sc.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {auto.emailAccount.emailAddress}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {auto._count.companies} companies
                          </span>
                          <span className="flex items-center gap-1">
                            <Send className="h-3 w-3" />
                            {auto._count.applications} sent
                          </span>
                          {auto.nextRunAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Next: {new Date(auto.nextRunAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(auto.status === 'active' || auto.status === 'paused') && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1"
                            onClick={() => handleToggleStatus(auto.id, auto.status)}
                          >
                            {auto.status === 'active' ? (
                              <><Pause className="h-3 w-3" /> Pause</>
                            ) : (
                              <><Play className="h-3 w-3" /> Resume</>
                            )}
                          </Button>
                        )}
                        <Link href={`/automation/${auto.id}`}>
                          <Button variant="outline" size="sm" className="h-8 text-xs">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
