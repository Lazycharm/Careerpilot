'use client'

/**
 * RecentActivity — dashboard widget showing the user's 8 latest activity
 * events with human labels. Drops in as a stand-alone card; no required
 * props.
 */

import { useEffect, useState } from 'react'

interface Activity {
  id: string
  event: string
  label: string
  createdAt: string
  meta?: unknown
}

export function RecentActivity() {
  const [items, setItems] = useState<Activity[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/activity', { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Failed (${r.status})`)
        return r.json() as Promise<{ items: Activity[] }>
      })
      .then((d) => {
        if (!cancelled) setItems(d.items.slice(0, 8))
      })
      .catch((err) => {
        if (!cancelled) setError((err as Error).message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent activity</h3>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {!items && !error && <p className="text-sm text-gray-500">Loading…</p>}
      {items && items.length === 0 && (
        <p className="text-sm text-gray-500">
          Your activity will show up here as soon as you build your first CV.
        </p>
      )}
      {items && items.length > 0 && (
        <ol className="space-y-2.5">
          {items.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-3 text-sm">
              <span className="text-gray-800">{a.label}</span>
              <time className="text-xs text-gray-500 flex-shrink-0">
                {timeAgo(a.createdAt)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}
