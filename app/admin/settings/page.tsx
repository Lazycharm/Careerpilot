'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'
import {
  Settings, Save, Globe, Sparkles, DollarSign, ToggleLeft,
  FileText, Home, Bell, Shield, Zap, ChevronRight, Check,
} from 'lucide-react'

interface Setting {
  key: string
  value: string
  description: string
}

// All settings with their defaults, descriptions, and UI type
const SETTING_DEFS: Array<{
  key: string
  label: string
  description: string
  type: 'toggle' | 'text' | 'number' | 'textarea'
  default: string
  group: string
}> = [
  // ── Platform ────────────────────────────────────────────────────────────
  { key: 'platform_name', label: 'Platform Name', description: 'Shown in emails and footer', type: 'text', default: 'Career Pilot', group: 'platform' },
  { key: 'platform_tagline', label: 'Platform Tagline', description: 'Short description under the name', type: 'text', default: 'AI-Powered Career Platform for UAE Professionals', group: 'platform' },
  { key: 'support_email', label: 'Support Email', description: 'Shown on contact pages and emails', type: 'text', default: 'support@careerpilot.io', group: 'platform' },
  { key: 'maintenance_mode', label: 'Maintenance Mode', description: 'Show maintenance page to all non-admin users', type: 'toggle', default: 'false', group: 'platform' },

  // ── Homepage CMS ────────────────────────────────────────────────────────
  { key: 'hero_headline', label: 'Hero Headline', description: 'Main hero headline text', type: 'text', default: 'Land your dream job with a resume that actually gets interviews', group: 'homepage' },
  { key: 'hero_subtext', label: 'Hero Subtext', description: 'Hero subtitle / description paragraph', type: 'textarea', default: 'Only 2% of resumes pass ATS filters. CareerPilot builds yours with AI — optimized keywords, professional templates, and interview coaching. All in one platform.', group: 'homepage' },
  { key: 'hero_cta_primary', label: 'Hero CTA (Primary)', description: 'Main CTA button label', type: 'text', default: 'Build My Resume Now', group: 'homepage' },
  { key: 'hero_cta_secondary', label: 'Hero CTA (Secondary)', description: 'Secondary button label', type: 'text', default: 'Upload Existing CV', group: 'homepage' },
  { key: 'stat_resumes', label: 'Stats: Resumes Created', description: 'Number shown in hero stats bar', type: 'number', default: '4200', group: 'homepage' },
  { key: 'stat_jobs', label: 'Stats: Jobs Tracked', description: 'Number shown in hero stats bar', type: 'number', default: '1800', group: 'homepage' },
  { key: 'stat_ats', label: 'Stats: ATS Pass Rate', description: 'Percentage shown in hero stats bar', type: 'number', default: '98', group: 'homepage' },
  { key: 'social_proof_label', label: 'Social Proof Band Label', description: 'Text above the company marquee', type: 'text', default: 'Trusted by professionals at leading UAE companies', group: 'homepage' },
  { key: 'testimonials_headline', label: 'Testimonials Headline', description: 'Section heading above testimonials', type: 'text', default: 'Real results from real job seekers', group: 'homepage' },
  { key: 'pricing_headline', label: 'Pricing Headline', description: 'Heading of pricing section', type: 'text', default: 'Simple, transparent pricing', group: 'homepage' },
  { key: 'pricing_subtext', label: 'Pricing Subtext', description: 'Description below pricing headline', type: 'text', default: 'Build now and download when you are ready. No commitment to start.', group: 'homepage' },
  { key: 'final_cta_headline', label: 'Final CTA Headline', description: 'Bottom-of-page conversion headline', type: 'text', default: 'Your next career move starts here', group: 'homepage' },
  { key: 'final_cta_subtext', label: 'Final CTA Subtext', description: 'Description in bottom CTA section', type: 'text', default: 'Stop sending resumes into silence. Let AI build one that actually gets responses — in under 10 minutes.', group: 'homepage' },

  // ── AI Features ─────────────────────────────────────────────────────────
  { key: 'ai_features_enabled', label: 'AI Features (Master Toggle)', description: 'Enable all AI features across the platform', type: 'toggle', default: 'true', group: 'ai' },
  { key: 'resume_ai_enabled', label: 'Resume AI Assistance', description: 'Enable AI assistance for resume building', type: 'toggle', default: 'true', group: 'ai' },
  { key: 'resume_ai_summary_enabled', label: 'AI Summary Generation', description: 'Allow AI to generate/improve professional summaries', type: 'toggle', default: 'true', group: 'ai' },
  { key: 'resume_ai_experience_enabled', label: 'AI Experience Optimization', description: 'Allow AI to optimize work experience bullet points', type: 'toggle', default: 'true', group: 'ai' },
  { key: 'resume_ai_skills_enabled', label: 'AI Skills Suggestions', description: 'Allow AI to suggest relevant skills', type: 'toggle', default: 'true', group: 'ai' },
  { key: 'cover_letter_ai_enabled', label: 'Cover Letter AI', description: 'Allow AI-generated cover letters', type: 'toggle', default: 'true', group: 'ai' },
  { key: 'interview_prep_enabled', label: 'Interview Prep AI', description: 'Enable interview preparation system', type: 'toggle', default: 'true', group: 'ai' },
  { key: 'ai_provider', label: 'AI Provider', description: 'Which AI backend to use: openai | anthropic | groq', type: 'text', default: 'openai', group: 'ai' },
  { key: 'ai_model', label: 'AI Model', description: 'Model ID for the selected provider', type: 'text', default: 'gpt-4o-mini', group: 'ai' },

  // ── Subscription & Pricing ───────────────────────────────────────────────
  { key: 'subscription_enabled', label: 'Subscription System', description: 'Enable subscription and payment gating', type: 'toggle', default: 'false', group: 'subscription' },
  { key: 'free_downloads_enabled', label: 'Free Downloads for All', description: 'Allow all users to download without payment', type: 'toggle', default: 'false', group: 'subscription' },
  { key: 'subscription_price', label: 'Monthly Subscription Price (AED)', description: 'Displayed and charged for pro plan', type: 'number', default: '100', group: 'subscription' },
  { key: 'resume_download_price', label: 'Resume Download Price (AED)', description: 'Pay-per-download price for resume PDF', type: 'number', default: '50', group: 'subscription' },
  { key: 'cover_letter_price', label: 'Cover Letter Download Price (AED)', description: 'Pay-per-download price for cover letter PDF', type: 'number', default: '30', group: 'subscription' },
  { key: 'trial_days', label: 'Trial Period (days)', description: 'Days of free trial for new pro signups (0 = disabled)', type: 'number', default: '0', group: 'subscription' },

  // ── Features & Limits ───────────────────────────────────────────────────
  { key: 'max_resumes_free', label: 'Max Resumes (Free Plan)', description: 'Maximum resumes a free user can create', type: 'number', default: '3', group: 'limits' },
  { key: 'max_cover_letters_free', label: 'Max Cover Letters (Free Plan)', description: 'Maximum cover letters per month for free users', type: 'number', default: '2', group: 'limits' },
  { key: 'max_interviews_free', label: 'Max Interview Sessions (Free Plan)', description: 'Interview prep sessions per month for free users', type: 'number', default: '5', group: 'limits' },
  { key: 'job_tracking_enabled', label: 'Job Tracking Feature', description: 'Enable the job application tracker', type: 'toggle', default: 'true', group: 'limits' },
  { key: 'career_roadmap_enabled', label: 'Career Roadmap Feature', description: 'Enable AI-generated career roadmaps', type: 'toggle', default: 'true', group: 'limits' },

  // ── Notifications ───────────────────────────────────────────────────────
  { key: 'email_notifications_enabled', label: 'Email Notifications', description: 'Send transactional and welcome emails', type: 'toggle', default: 'true', group: 'notifications' },
  { key: 'welcome_email_enabled', label: 'Welcome Email', description: 'Send welcome email on registration', type: 'toggle', default: 'true', group: 'notifications' },
  { key: 'welcome_email_subject', label: 'Welcome Email Subject', description: 'Subject line for welcome email', type: 'text', default: 'Welcome to Career Pilot — Let\'s build your resume', group: 'notifications' },
]

const GROUPS: Array<{ key: string; label: string; icon: React.ReactNode; color: string }> = [
  { key: 'platform', label: 'Platform', icon: <Globe className="h-4 w-4" />, color: 'blue' },
  { key: 'homepage', label: 'Homepage Content', icon: <Home className="h-4 w-4" />, color: 'violet' },
  { key: 'ai', label: 'AI Features', icon: <Sparkles className="h-4 w-4" />, color: 'purple' },
  { key: 'subscription', label: 'Subscription & Pricing', icon: <DollarSign className="h-4 w-4" />, color: 'green' },
  { key: 'limits', label: 'Feature Limits', icon: <Zap className="h-4 w-4" />, color: 'orange' },
  { key: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" />, color: 'teal' },
]

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set())
  const [activeGroup, setActiveGroup] = useState('platform')

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/login'); return }
    if (status === 'authenticated' && session?.user?.role !== 'admin') { router.push('/dashboard'); return }
    if (status === 'authenticated' && session?.user?.role === 'admin') fetchSettings()
  }, [status, session, router])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data: Setting[] = await res.json()
        const map: Record<string, string> = {}
        data.forEach((s) => { map[s.key] = s.value })
        // Fill in defaults for any missing settings
        SETTING_DEFS.forEach((def) => {
          if (!(def.key in map)) map[def.key] = def.default
        })
        setSettings(map)
      }
    } catch (e) {
      console.error('Failed to fetch settings', e)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = useCallback((key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSave = async (groupKey?: string) => {
    setSaving(true)
    try {
      const defs = groupKey ? SETTING_DEFS.filter((d) => d.group === groupKey) : SETTING_DEFS
      const payload = defs.map((def) => ({
        key: def.key,
        value: settings[def.key] ?? def.default,
        description: def.description,
      }))
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: payload }),
      })
      if (res.ok) {
        const newSaved = new Set(savedKeys)
        payload.forEach((p) => newSaved.add(p.key))
        setSavedKeys(newSaved)
        setTimeout(() => setSavedKeys(new Set()), 2500)
      }
    } catch (e) {
      console.error('Save failed', e)
    } finally {
      setSaving(false)
    }
  }

  const val = (key: string) => settings[key] ?? SETTING_DEFS.find((d) => d.key === key)?.default ?? ''

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  const activeDefs = SETTING_DEFS.filter((d) => d.group === activeGroup)
  const activeGroupMeta = GROUPS.find((g) => g.key === activeGroup)!

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Platform Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Configure every aspect of Career Pilot</p>
          </div>
          <Button onClick={() => handleSave()} disabled={saving} className="gap-2">
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving…' : 'Save All'}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar nav */}
          <aside className="lg:w-56 flex-shrink-0">
            <Card className="p-1.5">
              <nav className="space-y-0.5">
                {GROUPS.map((g) => (
                  <button
                    key={g.key}
                    onClick={() => setActiveGroup(g.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                      activeGroup === g.key
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {g.icon}
                    {g.label}
                    {activeGroup === g.key && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
                  </button>
                ))}
              </nav>
            </Card>

            {/* Webhook card */}
            <Card className="mt-4 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Webhook
              </p>
              <p className="text-xs text-gray-500 mb-3">Register payment webhook with Ziina</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={async () => {
                  if (!confirm('Register webhook with Ziina?')) return
                  const res = await fetch('/api/admin/webhook/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ generateSecret: true }),
                  })
                  const data = await res.json()
                  if (res.ok && data.fullSecret) {
                    alert(`Webhook registered!\n\nAdd to .env.local:\n\nZIINA_WEBHOOK_SECRET="${data.fullSecret}"\n\nThen restart server.`)
                  } else if (res.ok) {
                    alert('Webhook registered.')
                  } else {
                    alert(data.error || 'Failed')
                  }
                }}
              >
                Register Ziina Webhook
              </Button>
            </Card>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  {activeGroupMeta.icon}
                  <div>
                    <CardTitle className="text-lg">{activeGroupMeta.label}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {activeDefs.length} settings in this section
                    </CardDescription>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSave(activeGroup)}
                  disabled={saving}
                  className="gap-1.5"
                >
                  {saving ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save Section
                </Button>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {activeDefs.map((def) => (
                  <div key={def.key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">{def.label}</Label>
                      {savedKeys.has(def.key) && (
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="h-3 w-3" /> Saved
                        </span>
                      )}
                    </div>

                    {def.type === 'toggle' ? (
                      <div className="flex items-center gap-3">
                        <button
                          role="switch"
                          aria-checked={val(def.key) === 'true'}
                          onClick={() => updateSetting(def.key, val(def.key) === 'true' ? 'false' : 'true')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                            val(def.key) === 'true' ? 'bg-primary' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              val(def.key) === 'true' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="text-sm text-gray-600">
                          {val(def.key) === 'true' ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    ) : def.type === 'textarea' ? (
                      <Textarea
                        rows={4}
                        value={val(def.key)}
                        onChange={(e) => updateSetting(def.key, e.target.value)}
                        className="text-sm resize-none"
                      />
                    ) : (
                      <Input
                        type={def.type === 'number' ? 'number' : 'text'}
                        value={val(def.key)}
                        onChange={(e) => updateSetting(def.key, e.target.value)}
                        className="text-sm"
                      />
                    )}

                    <p className="text-xs text-gray-500">{def.description}</p>
                    {def.key.startsWith('ai_') && (
                      <div className="mt-1 text-[10px] font-mono bg-gray-50 border rounded px-2 py-1 text-gray-400 select-all">
                        key: {def.key}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}
