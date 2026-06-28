'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'
import { ArrowLeft, Mail, Building2, AlertCircle } from 'lucide-react'

interface EmailAccount {
  id: string
  emailAddress: string
  isActive: boolean
}

interface Company {
  id: string
  name: string
  industry: string | null
}

interface ResumeOption {
  id: string
  title: string
}

interface CoverLetterOption {
  id: string
  jobTitle: string
}

export default function NewAutomationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [resumes, setResumes] = useState<ResumeOption[]>([])
  const [coverLetters, setCoverLetters] = useState<CoverLetterOption[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const [name, setName] = useState('')
  const [emailAccountId, setEmailAccountId] = useState('')
  const [resumeId, setResumeId] = useState('')
  const [coverLetterId, setCoverLetterId] = useState('')
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([])
  const [cadenceMinutes, setCadenceMinutes] = useState(30)
  const [dailyCap, setDailyCap] = useState(10)
  const [startHour, setStartHour] = useState(9)
  const [endHour, setEndHour] = useState(18)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (status === 'authenticated') fetchAll()
  }, [status])

  const fetchAll = async () => {
    try {
      const [accRes, compRes, resRes, clRes] = await Promise.all([
        fetch('/api/email-accounts'),
        fetch('/api/admin/companies'),
        fetch('/api/resumes'),
        fetch('/api/cover-letters'),
      ])

      if (accRes.ok) {
        const data = await accRes.json()
        const accs = data.accounts || []
        setEmailAccounts(accs)
        if (accs.length > 0) setEmailAccountId(accs[0].id)
      }
      if (compRes.ok) {
        const data = await compRes.json()
        setCompanies(Array.isArray(data) ? data : data.items || data.companies || [])
      }
      if (resRes.ok) {
        const data = await resRes.json()
        setResumes(Array.isArray(data) ? data : [])
      }
      if (clRes.ok) {
        const data = await clRes.json()
        setCoverLetters(Array.isArray(data) ? data : data.coverLetters || [])
      }
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleCompany = (id: string) => {
    setSelectedCompanyIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !emailAccountId || selectedCompanyIds.length === 0) {
      alert('Please fill in the name, select an email account, and choose at least one company.')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          emailAccountId,
          resumeId: resumeId || undefined,
          coverLetterId: coverLetterId || undefined,
          companyIds: selectedCompanyIds,
          schedule: {
            cadenceMinutes,
            dailyCap,
            startHour,
            endHour,
            timezone: 'Asia/Dubai',
          },
        }),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/automation/${data.id}`)
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to create automation')
      }
    } catch {
      alert('Failed to create automation. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (emailAccounts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="flex flex-col items-center py-10 px-6">
              <Mail className="h-14 w-14 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connect Gmail first</h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                You need to connect a Gmail account before creating an automation.
              </p>
              <Link href="/automation/email-accounts">
                <Button className="min-h-[44px] gap-2">
                  <Mail className="h-4 w-4" />
                  Connect Gmail Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
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

        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Create New Automation</h1>

        <form onSubmit={handleCreate} className="max-w-2xl space-y-6">
          {/* Name */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Automation Name</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="e.g., Dubai Tech Companies — June 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="min-h-[44px]"
              />
            </CardContent>
          </Card>

          {/* Email Account */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Send From</CardTitle>
              <CardDescription>Which Gmail account should send the applications?</CardDescription>
            </CardHeader>
            <CardContent>
              <select
                value={emailAccountId}
                onChange={(e) => setEmailAccountId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {emailAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.emailAddress}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Resume & Cover Letter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Attachments</CardTitle>
              <CardDescription>Select a resume and cover letter to include (optional — AI can generate per company)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-gray-500">Resume</Label>
                <select
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">AI generates per company</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Cover Letter</Label>
                <select
                  value={coverLetterId}
                  onChange={(e) => setCoverLetterId(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">AI generates per company</option>
                  {coverLetters.map((cl) => (
                    <option key={cl.id} value={cl.id}>{cl.jobTitle}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Target Companies */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Target Companies ({selectedCompanyIds.length} selected)
              </CardTitle>
              <CardDescription>Choose which companies to send applications to</CardDescription>
            </CardHeader>
            <CardContent>
              {companies.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  No companies found. Ask your admin to add companies first.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-1 border rounded-md p-2">
                  {companies.map((company) => (
                    <label
                      key={company.id}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedCompanyIds.includes(company.id) ? 'bg-primary/5 border border-primary/20' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCompanyIds.includes(company.id)}
                        onChange={() => toggleCompany(company.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{company.name}</span>
                        {company.industry && (
                          <span className="text-xs text-gray-500 ml-2">{company.industry}</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Schedule</CardTitle>
              <CardDescription>Configure when and how often applications are sent (Asia/Dubai timezone)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Send every (minutes)</Label>
                  <Input
                    type="number"
                    min={5}
                    max={1440}
                    value={cadenceMinutes}
                    onChange={(e) => setCadenceMinutes(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Daily cap</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={dailyCap}
                    onChange={(e) => setDailyCap(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Start hour</Label>
                  <Input
                    type="number"
                    min={0}
                    max={23}
                    value={startHour}
                    onChange={(e) => setStartHour(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">End hour</Label>
                  <Input
                    type="number"
                    min={1}
                    max={24}
                    value={endHour}
                    onChange={(e) => setEndHour(Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating || !name.trim() || !emailAccountId || selectedCompanyIds.length === 0}
              className="min-h-[44px] flex-1 sm:flex-none"
            >
              {creating ? 'Creating...' : 'Create Automation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
