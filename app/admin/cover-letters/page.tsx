'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Navbar } from '@/components/shared/Navbar'
import { ArrowLeft, FileText, Eye, EyeOff, Mail, Plus } from 'lucide-react'
import Link from 'next/link'

interface CLTemplate {
  key: string
  name: string
  description: string
  accentColor: string
  isPremium: boolean
  usageCount: number
  isEnabled: boolean
}

export default function AdminCoverLettersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [templates, setTemplates] = useState<CLTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{ total: number; thisMonth: number } | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') fetchData()
    else if (status === 'authenticated') router.push('/dashboard')
    else if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, session])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/cover-letter-templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.templates || [])
        setStats(data.stats || null)
      }
    } catch (err) {
      console.error('Failed to fetch CL templates:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (key: string, currentEnabled: boolean) => {
    setToggling(key)
    try {
      const res = await fetch('/api/admin/cover-letter-templates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, isEnabled: !currentEnabled }),
      })
      if (res.ok) fetchData()
      else alert('Failed to update template')
    } catch { alert('Failed to update template') }
    finally { setToggling(null) }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Link href="/admin" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-4 gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Admin
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Mail className="h-7 w-7" /> Cover Letter Templates
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage which cover letter templates are available to users
            </p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 mb-1">Total Templates</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 mb-1">Enabled</p>
                <p className="text-2xl font-bold text-green-600">{templates.filter(t => t.isEnabled).length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 mb-1">Total Generated</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 mb-1">This Month</p>
                <p className="text-2xl font-bold text-primary">{stats.thisMonth}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Templates Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => (
              <Card key={t.key} className={`overflow-hidden transition-opacity ${!t.isEnabled ? 'opacity-60' : ''}`}>
                <div className="h-1.5" style={{ background: t.accentColor }} />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{t.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{t.description}</p>
                    </div>
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0 ml-2 border-2 border-white shadow-sm"
                      style={{ background: t.accentColor }}
                    />
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={t.isEnabled ? 'default' : 'secondary'} className="text-xs">
                      {t.isEnabled ? 'Active' : 'Hidden'}
                    </Badge>
                    {t.isPremium && <Badge variant="outline" className="text-xs">Premium</Badge>}
                    <span className="text-xs text-gray-400 ml-auto">
                      <span className="font-medium text-gray-600">{t.usageCount}</span> uses
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <code className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 flex-1 truncate">
                      {t.key}
                    </code>
                    <Button
                      size="sm" variant="outline"
                      className="h-7 text-xs gap-1 flex-shrink-0"
                      disabled={toggling === t.key}
                      onClick={() => handleToggle(t.key, t.isEnabled)}
                    >
                      {t.isEnabled
                        ? <><EyeOff className="h-3 w-3" /> Hide</>
                        : <><Eye className="h-3 w-3" /> Show</>
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-8 border-blue-200 bg-blue-50/50">
          <CardContent className="p-5">
            <div className="flex gap-3">
              <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 text-sm mb-1">About Cover Letter Templates</p>
                <p className="text-sm text-blue-700">
                  Cover letter templates are defined in code at <code className="bg-blue-100 px-1 rounded">lib/coverLetter/templates/</code>.
                  Use the toggles above to show/hide templates for users. To add a new template design,
                  create a new folder with a <code className="bg-blue-100 px-1 rounded">Template.tsx</code> and register it in the registry file.
                </p>
                <div className="mt-3 flex gap-2">
                  <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">11 templates available</Badge>
                  <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">UAE-optimized designs</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
