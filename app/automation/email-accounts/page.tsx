'use client'

import { Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'
import { Mail, Plus, Trash2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'

interface EmailAccount {
  id: string
  emailAddress: string
  displayName: string | null
  provider: string
  isActive: boolean
  lastUsedAt: string | null
  createdAt: string
}

export default function EmailAccountsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>}>
      <EmailAccountsContent />
    </Suspense>
  )
}

function EmailAccountsContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [accounts, setAccounts] = useState<EmailAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  const connected = searchParams.get('connected')
  const error = searchParams.get('error')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (status === 'authenticated') fetchAccounts()
  }, [status])

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/email-accounts')
      if (res.ok) {
        const data = await res.json()
        setAccounts(data.accounts || [])
      }
    } catch (err) {
      console.error('Failed to fetch accounts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = () => {
    setConnecting(true)
    window.location.href = '/api/email-accounts/oauth/google/start'
  }

  const handleDisconnect = async (id: string) => {
    if (!confirm('Disconnect this email account? Active automations using it will be paused.')) return
    try {
      const res = await fetch(`/api/email-accounts/${id}`, { method: 'DELETE' })
      if (res.ok) fetchAccounts()
      else alert('Failed to disconnect account')
    } catch {
      alert('Failed to disconnect account')
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
        <Link href="/automation" className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-4 gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Automations
        </Link>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Email Accounts</h1>
            <p className="text-sm text-gray-600 mt-1">Connect your Gmail to send automated job applications</p>
          </div>
          <Button onClick={handleConnect} disabled={connecting} className="min-h-[44px] gap-2">
            <Plus className="h-4 w-4" />
            {connecting ? 'Connecting...' : 'Connect Gmail'}
          </Button>
        </div>

        {/* Success/Error banners */}
        {connected && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>Successfully connected <strong>{connected}</strong>. You can now use it in automations.</span>
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>Connection failed: {error}</span>
          </div>
        )}

        {accounts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 px-4">
              <Mail className="h-14 w-14 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No email accounts connected</h3>
              <p className="text-sm text-gray-600 mb-6 text-center max-w-sm">
                Connect your Gmail account to start sending automated job applications to companies.
              </p>
              <Button onClick={handleConnect} disabled={connecting} className="min-h-[44px] gap-2">
                <Mail className="h-4 w-4" />
                {connecting ? 'Connecting...' : 'Connect Gmail Account'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <Card key={account.id}>
                <CardContent className="flex items-center justify-between p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{account.emailAddress}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center gap-1 text-xs ${account.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${account.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {account.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {account.provider === 'gmail' ? 'Gmail' : 'SMTP'}
                        </span>
                        {account.lastUsedAt && (
                          <span className="text-xs text-gray-400">
                            Last used {new Date(account.lastUsedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDisconnect(account.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
