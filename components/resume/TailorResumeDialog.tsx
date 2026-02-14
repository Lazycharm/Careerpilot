'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X } from 'lucide-react'

interface TailorResumeDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (jobTitle: string, jobDescription?: string) => void
  loading?: boolean
}

export function TailorResumeDialog({ open, onClose, onConfirm, loading }: TailorResumeDialogProps) {
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobTitle.trim()) return
    onConfirm(jobTitle.trim(), jobDescription.trim() || undefined)
    // Reset form
    setJobTitle('')
    setJobDescription('')
  }

  const handleClose = () => {
    setJobTitle('')
    setJobDescription('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tailor Resume for Job</CardTitle>
              <CardDescription>
                Enter the job details to optimize your resume for this specific role
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description (Optional)</Label>
              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Providing the job description helps AI better tailor your resume
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !jobTitle.trim()}
              >
                {loading ? 'Tailoring...' : 'Tailor Resume'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

