'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/shared/Navbar'
import { Zap, Pause, Play, ArrowLeft, Mail, Building2, Send, Clock } from 'lucide-react'
import Link from 'next/link'

interface AdminAutomation {
  id: string
  name: string
  status: string
  nextRunAt: string | null
  lastRunAt: string | null
  createdAt: string
  user: { id: string; name: string | null; email: string }
  emailAccount: { emailAddress: string }
  _count: { companies: number; applications: number; runs: number }
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default', paused: 'secondary', completed: 'outline', errored: 'destructive',
}

export default function AdminAutomationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [automations, setAutomations] = useState<AdminAutomation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') fetchAll()
    else if (status === 'authenticated') router.push('/dashboard')
    else if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, session])

  const fetchAll = async () => {
    try {
      const res = await fetch('/api/admin/automations')
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

  const handleToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    try {
      const res = await fetch(`/api/admin/automations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) fetchAll()
      else alert('Failed to update')
    } catch { alert('Failed to update') }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>
  }

  const active = automations.filter(a => a.status === 'active').length
  const totalSent = automations.reduce((s, a) => s + a._count.applications, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Link href="/admin" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-4 gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Admin
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 mb-6">
          <Zap className="h-7 w-7" /> Automation Monitor
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card><CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Total</p>
            <p className="text-xl font-bold">{automations.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Active</p>
            <p className="text-xl font-bold text-green-600">{active}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Applications Sent</p>
            <p className="text-xl font-bold">{totalSent}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Errored</p>
            <p className="text-xl font-bold text-red-600">{automations.filter(a => a.status === 'errored').length}</p>
          </CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 text-xs font-medium text-gray-500">Automation</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500">User</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500">Email</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500">Stats</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500">Status</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500">Next Run</th>
                    <th className="text-right p-3 text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {automations.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-sm text-gray-500">No automations found</td></tr>
                  ) : automations.map((a) => (
                    <tr key={a.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium text-sm">{a.name}</div>
                        <div className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="p-3 text-sm">
                        <div>{a.user.name || '—'}</div>
                        <div className="text-xs text-gray-400">{a.user.email}</div>
                      </td>
                      <td className="p-3 text-xs text-gray-600">{a.emailAccount.emailAddress}</td>
                      <td className="p-3">
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{a._count.companies}</span>
                          <span className="flex items-center gap-1"><Send className="h-3 w-3" />{a._count.applications}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={statusVariant[a.status] || 'secondary'} className="text-[10px]">{a.status}</Badge>
                      </td>
                      <td className="p-3 text-xs text-gray-500">
                        {a.nextRunAt ? new Date(a.nextRunAt).toLocaleString() : '—'}
                      </td>
                      <td className="p-3 text-right">
                        {(a.status === 'active' || a.status === 'paused') && (
                          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => handleToggle(a.id, a.status)}>
                            {a.status === 'active' ? <><Pause className="h-3 w-3" /> Pause</> : <><Play className="h-3 w-3" /> Resume</>}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
