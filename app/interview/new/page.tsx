'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'
import { Target, Sparkles } from 'lucide-react'
import { SuggestInput } from '@/components/ui/suggest-input'
import { JOB_TITLES } from '@/lib/suggestions'

const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Real Estate',
  'Retail & E-commerce', 'Hospitality & Tourism', 'Oil & Gas', 'Construction',
  'Education', 'Legal', 'Marketing & Advertising', 'Logistics & Supply Chain',
  'Human Resources', 'Consulting', 'Media & Communications', 'Aviation',
  'Government & Public Sector', 'Manufacturing', 'Telecommunications', 'Insurance',
]

export default function NewInterviewPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    jobTitle: '',
    industry: '',
    experienceLevel: 'mid',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/interview/${data.id}`)
      } else {
        setError(data.error || 'Failed to create interview session')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-2xl">
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Start Interview Preparation</CardTitle>
                <CardDescription className="text-sm mt-0.5">
                  Get AI-generated questions tailored to your role and level
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-700 border border-red-200 text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="jobTitle">Job Title <span className="text-red-500">*</span></Label>
                <SuggestInput
                  id="jobTitle"
                  placeholder="e.g., Software Engineer, Sales Executive"
                  value={formData.jobTitle}
                  onChange={(val) => setFormData({ ...formData, jobTitle: val })}
                  suggestions={JOB_TITLES}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="industry">Industry <span className="text-red-500">*</span></Label>
                <SuggestInput
                  id="industry"
                  placeholder="e.g., Technology, Finance, Healthcare"
                  value={formData.industry}
                  onChange={(val) => setFormData({ ...formData, industry: val })}
                  suggestions={INDUSTRIES}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="experienceLevel">Experience Level <span className="text-red-500">*</span></Label>
                <select
                  id="experienceLevel"
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                  required
                >
                  <option value="fresh">Fresh Graduate</option>
                  <option value="junior">Junior (1-3 years)</option>
                  <option value="mid">Mid-Level (3-7 years)</option>
                  <option value="senior">Senior (7+ years)</option>
                </select>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-[44px]"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.jobTitle || !formData.industry}
                  className="flex-1 min-h-[44px] gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 border-0"
                >
                  <Sparkles className="h-4 w-4" />
                  {loading ? 'Generating questions…' : 'Start Practice'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
