'use client'

/**
 * NotificationBell — drop-in component for the user navbar.
 *
 * Polls /api/notifications every 30 s, surfaces the unread count as a badge,
 * and opens a panel with the 10 newest entries. Click an item to mark it
 * read and follow its `href`. "Mark all read" wipes the badge.
 *
 * Stays UI-only — no state library, no portal, plain Tailwind.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'

interface Notification {
  id: string
  channel: string
  title: string
  body: string
  href: string | null
  readAt: string | null
  createdAt: string
}

const POLL_MS = 30_000

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const ref = useRef<HTMLDivElement | null>(null)

  const fetchOnce = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as { items: Notification[]; unreadCount: number }
      setItems(data.items)
      setUnread(data.unreadCount)
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchOnce()
    const id = setInterval(fetchOnce, POLL_MS)
    return () => clearInterval(id)
  }, [fetchOnce])

  // Click outside to close
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  async function markRead(id: string) {
    setItems((prev) =>
      prev.map((n) => (n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n))
    )
    setUnread((u) => Math.max(0, u - 1))
    fetch(`/api/notifications/${id}/read`, { method: 'POST' }).catch(() => {})
  }

  async function markAll() {
    setItems((prev) =>
      prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() }))
    )
    setUnread(0)
    fetch('/api/notifications/read-all', { method: 'POST' }).catch(() => {})
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-700" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="text-xs text-blue-700 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && (
              <div className="px-4 py-8 text-sm text-gray-500 text-center">
                You&apos;re all caught up.
              </div>
            )}
            <ul className="divide-y divide-gray-100">
              {items.map((n) => {
                const Card = (
                  <div
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${n.readAt ? '' : 'bg-blue-50/40'}`}
                    onClick={() => markRead(n.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <time className="text-xs text-gray-500 flex-shrink-0">
                        {timeAgo(n.createdAt)}
                      </time>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{n.body}</p>
                  </div>
                )
                return (
                  <li key={n.id}>
                    {n.href ? (
                      <Link href={n.href} onClick={() => setOpen(false)}>
                        {Card}
                      </Link>
                    ) : (
                      Card
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  return `${d}d`
}
