'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'
import { Settings, Save } from 'lucide-react'

interface Setting {
  key: string
  value: string
  description: string
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchSettings()
    }
  }, [status, session, router])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        
        // Ensure all required settings exist, initialize missing ones
        const requiredSettings = [
          'ai_features_enabled',
          'resume_ai_enabled',
          'resume_ai_summary_enabled',
          'resume_ai_experience_enabled',
          'resume_ai_skills_enabled',
          'free_downloads_enabled',
          'interview_prep_enabled',
          'subscription_enabled',
          'subscription_price',
          'resume_download_price',
          'cover_letter_price',
        ]
        
        const existingKeys = data.map((s: Setting) => s.key)
        const missingSettings = requiredSettings.filter(key => !existingKeys.includes(key))
        
        if (missingSettings.length > 0) {
          // Initialize missing settings with defaults
          const defaults: Record<string, { value: string; description: string }> = {
            'ai_features_enabled': { value: 'true', description: 'Enable AI features globally (master toggle)' },
            'resume_ai_enabled': { value: 'true', description: 'Enable AI assistance for resume building' },
            'resume_ai_summary_enabled': { value: 'true', description: 'Enable AI for professional summary generation' },
            'resume_ai_experience_enabled': { value: 'true', description: 'Enable AI for work experience optimization' },
            'resume_ai_skills_enabled': { value: 'true', description: 'Enable AI for skills suggestions' },
            'free_downloads_enabled': { value: 'false', description: 'Allow free downloads for all users' },
            'interview_prep_enabled': { value: 'true', description: 'Enable interview preparation system' },
            'subscription_enabled': { value: 'false', description: 'Enable subscription system globally' },
            'subscription_price': { value: '100', description: 'Monthly subscription price in AED' },
            'resume_download_price': { value: '50', description: 'Price for resume PDF download in AED' },
            'cover_letter_price': { value: '30', description: 'Price for cover letter download in AED' },
          }
          
          const newSettings = missingSettings.map(key => ({
            key,
            value: defaults[key]?.value || 'true',
            description: defaults[key]?.description || '',
          }))
          
          // Add to local state
          setSettings([...data, ...newSettings])
          
          // Save to database
          try {
            await fetch('/api/admin/settings', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                settings: [...data, ...newSettings].map(s => ({
                  key: s.key,
                  value: s.value,
                  description: s.description,
                }))
              }),
            })
          } catch (saveError) {
            console.error('Failed to save missing settings:', saveError)
            // Still show the settings in UI even if save fails
            setSettings([...data, ...newSettings])
          }
        } else {
          setSettings(data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })

      if (response.ok) {
        alert('Settings saved successfully!')
      } else {
        alert('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: string, value: string) => {
    setSettings(settings.map(s => s.key === key ? { ...s, value } : s))
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Platform Settings</h1>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save All Settings'}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Subscription Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Subscription System
              </CardTitle>
              <CardDescription>Control subscription and payment features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Enable Subscription System</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={settings.find(s => s.key === 'subscription_enabled')?.value || 'false'}
                  onChange={(e) => updateSetting('subscription_enabled', e.target.value)}
                >
                  <option value="false">Disabled</option>
                  <option value="true">Enabled</option>
                </select>
                <p className="text-xs text-gray-500">
                  {settings.find(s => s.key === 'subscription_enabled')?.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Subscription Price (AED)</Label>
                <Input
                  type="number"
                  value={settings.find(s => s.key === 'subscription_price')?.value || '100'}
                  onChange={(e) => updateSetting('subscription_price', e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  {settings.find(s => s.key === 'subscription_price')?.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Resume Download Price (AED)</Label>
                <Input
                  type="number"
                  value={settings.find(s => s.key === 'resume_download_price')?.value || '50'}
                  onChange={(e) => updateSetting('resume_download_price', e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  {settings.find(s => s.key === 'resume_download_price')?.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Cover Letter Price (AED)</Label>
                <Input
                  type="number"
                  value={settings.find(s => s.key === 'cover_letter_price')?.value || '30'}
                  onChange={(e) => updateSetting('cover_letter_price', e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  {settings.find(s => s.key === 'cover_letter_price')?.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Features */}
          <Card>
            <CardHeader>
              <CardTitle>AI Features</CardTitle>
              <CardDescription>Control AI-powered resume assistance features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>AI Features (Master Toggle)</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={settings.find(s => s.key === 'ai_features_enabled')?.value || 'true'}
                  onChange={(e) => updateSetting('ai_features_enabled', e.target.value)}
                >
                  <option value="false">Disabled</option>
                  <option value="true">Enabled</option>
                </select>
                <p className="text-xs text-gray-500">
                  {settings.find(s => s.key === 'ai_features_enabled')?.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Resume AI Assistance</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={settings.find(s => s.key === 'resume_ai_enabled')?.value || 'true'}
                  onChange={(e) => updateSetting('resume_ai_enabled', e.target.value)}
                >
                  <option value="false">Disabled</option>
                  <option value="true">Enabled</option>
                </select>
                <p className="text-xs text-gray-500">
                  {settings.find(s => s.key === 'resume_ai_enabled')?.description}
                </p>
              </div>

              <div className="ml-6 space-y-3 border-l-2 pl-4">
                <div className="space-y-2">
                  <Label className="text-sm">AI Summary Generation</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={settings.find(s => s.key === 'resume_ai_summary_enabled')?.value || 'true'}
                    onChange={(e) => updateSetting('resume_ai_summary_enabled', e.target.value)}
                  >
                    <option value="false">Disabled</option>
                    <option value="true">Enabled</option>
                  </select>
                  <p className="text-xs text-gray-500">
                    Allow AI to generate/improve professional summaries
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">AI Experience Optimization</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={settings.find(s => s.key === 'resume_ai_experience_enabled')?.value || 'true'}
                    onChange={(e) => updateSetting('resume_ai_experience_enabled', e.target.value)}
                  >
                    <option value="false">Disabled</option>
                    <option value="true">Enabled</option>
                  </select>
                  <p className="text-xs text-gray-500">
                    Allow AI to optimize work experience bullet points
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">AI Skills Suggestions</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={settings.find(s => s.key === 'resume_ai_skills_enabled')?.value || 'true'}
                    onChange={(e) => updateSetting('resume_ai_skills_enabled', e.target.value)}
                  >
                    <option value="false">Disabled</option>
                    <option value="true">Enabled</option>
                  </select>
                  <p className="text-xs text-gray-500">
                    Allow AI to suggest relevant skills based on job title/industry
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ziina Webhook */}
          <Card>
            <CardHeader>
              <CardTitle>Ziina Webhook Configuration</CardTitle>
              <CardDescription>Register webhook endpoint to receive payment notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/payments/webhook`}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  This is your webhook endpoint URL. Register it with Ziina to receive payment notifications.
                </p>
              </div>
              <Button
                onClick={async () => {
                  if (!confirm('This will register the webhook with Ziina. Continue?')) return
                  
                  try {
                    const response = await fetch('/api/admin/webhook/register', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        generateSecret: true,
                      }),
                    })
                    
                    if (response.ok) {
                      const result = await response.json()
                      if (result.fullSecret) {
                        alert(`Webhook registered!\n\nIMPORTANT: Add this to your .env.local file:\n\nZIINA_WEBHOOK_SECRET="${result.fullSecret}"\n\nThen restart your server.`)
                      } else {
                        alert('Webhook registered successfully!')
                      }
                    } else {
                      const error = await response.json()
                      alert(error.error || 'Failed to register webhook')
                    }
                  } catch (error) {
                    console.error('Webhook registration error:', error)
                    alert('Failed to register webhook. Check console for details.')
                  }
                }}
                variant="outline"
              >
                Register Webhook with Ziina
              </Button>
              <p className="text-xs text-gray-500">
                💡 Tip: You can also use the setup script: <code className="bg-gray-100 px-1 rounded">npx tsx scripts/setup-ziina-webhook.ts</code>
              </p>
            </CardContent>
          </Card>

          {/* Feature Toggles */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Free Downloads</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={settings.find(s => s.key === 'free_downloads_enabled')?.value || 'false'}
                  onChange={(e) => updateSetting('free_downloads_enabled', e.target.value)}
                >
                  <option value="false">Disabled</option>
                  <option value="true">Enabled</option>
                </select>
                <p className="text-xs text-gray-500">
                  {settings.find(s => s.key === 'free_downloads_enabled')?.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Interview Preparation</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={settings.find(s => s.key === 'interview_prep_enabled')?.value || 'true'}
                  onChange={(e) => updateSetting('interview_prep_enabled', e.target.value)}
                >
                  <option value="false">Disabled</option>
                  <option value="true">Enabled</option>
                </select>
                <p className="text-xs text-gray-500">
                  {settings.find(s => s.key === 'interview_prep_enabled')?.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

