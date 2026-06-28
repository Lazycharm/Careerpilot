'use client'

/**
 * Admin Payments Queue.
 *
 * The most-used admin screen. Shows pending payments first, allows one-click
 * Approve / Reject with note + reason capture. Auto-refreshes every 20 s so
 * incoming WhatsApp requests appear without a manual reload.
 *
 * Built deliberately small — no shadcn primitives yet (those land with the
 * fuller admin shell). This page is functional first, pretty later.
 */

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type PaymentStatus =
  | 'created'
  | 'pending_whatsapp'
  | 'pending_ziina'
  | 'approved'
  | 'rejected'
  | 'refunded'
  | 'failed'

type PaymentMethod = 'whatsapp' | 'ziina' | 'manual_other'

interface PaymentRow {
  id: string
  method: PaymentMethod
  status: PaymentStatus
  amountFils: number
  currency: string
  whatsappUrl: string | null
  whatsappRequestText: string | null
  adminNote: string | null
  rejectedReason: string | null
  createdAt: string
  user: { id: string; email: string; name: string } | null
  pricing: { code: string; name: string; amountFils: number } | null
}

interface QueueResponse {
  items: PaymentRow[]
  page: number
  pageSize: number
  total: number
  pendingCount: number
}

const STATUS_FILTERS: Array<{ label: string; value: PaymentStatus | 'all' }> = [
  { label: 'Pending (all)', value: 'pending_whatsapp' },
  { label: 'Pending Ziina', value: 'pending_ziina' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'All', value: 'all' },
]

export default function AdminPaymentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('pending_whatsapp')
  const [data, setData] = useState<QueueResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actingId, setActingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    if (status === 'authenticated' && session?.user?.role !== 'admin') router.push('/dashboard')
  }, [status, session, router])

  const fetchQueue = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch(`/api/admin/payments?status=${encodeURIComponent(statusFilter)}`, {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      const json = (await res.json()) as QueueResponse
      setData(json)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchQueue()
    // Poll for new WhatsApp requests every 20 s.
    const id = setInterval(fetchQueue, 20_000)
    return () => clearInterval(id)
  }, [fetchQueue])

  async function approve(id: string) {
    const note = window.prompt('Approval note (optional, shown in audit log):') ?? ''
    if (note === null) return
    if (!window.confirm('Approve this payment? The user gets an email + in-app notification.')) return
    setActingId(id)
    try {
      const res = await fetch(`/api/admin/payments/${id}/approve`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ note }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Failed (${res.status})`)
      }
      await fetchQueue()
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setActingId(null)
    }
  }

  async function reject(id: string) {
    const reason = window.prompt('Rejection reason (shown to the user):')
    if (!reason?.trim()) {
      if (reason !== null) alert('A reason is required.')
      return
    }
    setActingId(id)
    try {
      const res = await fetch(`/api/admin/payments/${id}/reject`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Failed (${res.status})`)
      }
      await fetchQueue()
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setActingId(null)
    }
  }

  if (status !== 'authenticated' || session?.user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
          <div>
            <Link href="/admin" className="text-sm text-blue-700 hover:underline">
              ← Admin home
            </Link>
            <h1 className="text-2xl font-bold mt-1">Payments</h1>
            <p className="text-sm text-gray-600">
              Pending WhatsApp + Ziina payments. Approving activates the user's subscription.
            </p>
          </div>
          {data && (
            <div className="text-sm">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-50 text-red-700 font-medium">
                {data.pendingCount} pending
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 text-sm rounded border ${
                statusFilter === f.value
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {loading && <div className="p-6 text-sm text-gray-500">Loading…</div>}
          {!loading && data && data.items.length === 0 && (
            <div className="p-6 text-sm text-gray-500">No payments in this view.</div>
          )}
          {!loading && data && data.items.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {data.items.map((p) => (
                <li key={p.id} className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-semibold">
                          {p.pricing?.name ?? p.pricing?.code ?? 'Unknown plan'}
                        </span>
                        <span className="text-gray-500">·</span>
                        <span className="font-mono">
                          {(p.amountFils / 100).toFixed(2)} {p.currency}
                        </span>
                        <span className="text-gray-500">·</span>
                        <StatusPill status={p.status} />
                        <span className="text-gray-500">·</span>
                        <span className="text-gray-600">{p.method}</span>
                      </div>
                      <div className="mt-1 text-sm text-gray-700">
                        {p.user?.name ?? '—'}{' '}
                        <span className="text-gray-500">&lt;{p.user?.email ?? 'unknown'}&gt;</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Created {new Date(p.createdAt).toLocaleString('en-AE')} · id{' '}
                        <span className="font-mono">{p.id.slice(0, 8)}…</span>
                      </div>
                      {p.adminNote && (
                        <div className="mt-2 text-xs text-gray-600">
                          <strong>Note:</strong> {p.adminNote}
                        </div>
                      )}
                      {p.rejectedReason && (
                        <div className="mt-2 text-xs text-red-700">
                          <strong>Rejected:</strong> {p.rejectedReason}
                        </div>
                      )}
                      {p.method === 'whatsapp' && p.whatsappUrl && (
                        <a
                          href={p.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 text-sm text-blue-700 hover:underline"
                        >
                          Open WhatsApp thread ↗
                        </a>
                      )}
                    </div>

                    {(p.status === 'pending_whatsapp' || p.status === 'pending_ziina') && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          type="button"
                          disabled={actingId === p.id}
                          onClick={() => approve(p.id)}
                          className="px-3 py-1.5 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {actingId === p.id ? '…' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          disabled={actingId === p.id}
                          onClick={() => reject(p.id)}
                          className="px-3 py-1.5 text-sm rounded bg-white border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, string> = {
    created: 'bg-gray-100 text-gray-700',
    pending_whatsapp: 'bg-amber-100 text-amber-800',
    pending_ziina: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
    refunded: 'bg-purple-100 text-purple-800',
    failed: 'bg-red-100 text-red-800',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[status]}`}>
      {status}
    </span>
  )
}
