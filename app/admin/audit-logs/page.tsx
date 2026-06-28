'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/shared/Navbar'
import { Shield, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface AuditLog {
  id: string
  action: string
  actor: string | null
  target: string | null
  meta: any
  createdAt: string
}

export default function AdminAuditLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [actionFilter, setActionFilter] = useState('')

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') fetchLogs()
    else if (status === 'authenticated') router.push('/dashboard')
    else if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, session, page, actionFilter])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ skip: String(page * 50), take: '51' })
      if (actionFilter) params.set('action', actionFilter)
      const res = await fetch(`/api/admin/audit-logs?${params}`)
      if (res.ok) {
        const data = await res.json()
        const items = Array.isArray(data) ? data : data.items || data.logs || []
        setHasMore(items.length > 50)
        setLogs(items.slice(0, 50))
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Link href="/admin" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-4 gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Admin
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 mb-6">
          <Shield className="h-7 w-7" /> Audit Logs
        </h1>

        <div className="flex items-center gap-3 mb-4">
          <Input
            placeholder="Filter by action (e.g., payment.approved)"
            value={actionFilter}
            onChange={e => { setActionFilter(e.target.value); setPage(0) }}
            className="max-w-sm"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 text-xs font-medium text-gray-500">Time</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500">Action</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500">Actor</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500">Target</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-sm text-gray-500">Loading...</td></tr>
                  ) : logs.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-sm text-gray-500">No audit logs found</td></tr>
                  ) : logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px] font-mono">{log.action}</Badge>
                      </td>
                      <td className="p-3 text-sm text-gray-600 truncate max-w-[200px]">{log.actor || '—'}</td>
                      <td className="p-3 text-sm text-gray-600 truncate max-w-[200px]">{log.target || '—'}</td>
                      <td className="p-3 text-xs text-gray-400 truncate max-w-[250px]">
                        {log.meta ? JSON.stringify(log.meta).slice(0, 80) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <span className="text-sm text-gray-500">Page {page + 1}</span>
          <Button variant="outline" size="sm" disabled={!hasMore} onClick={() => setPage(p => p + 1)} className="gap-1">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
