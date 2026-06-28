'use client'

/**
 * PDFPreviewDialog — Phase 1 rewrite.
 *
 * Renders the actual server-generated PDF in an iframe (was: html2canvas
 * screenshot of an HTML proxy, which lied about the true layout). The dialog
 * fetches /api/resumes/preview as a Blob and shows it via `URL.createObjectURL`,
 * giving the user a true WYSIWYG preview before they download.
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Download, Loader2 } from 'lucide-react'
import type { ResumeData } from '@/types'

interface PDFPreviewDialogProps {
  open: boolean
  onClose: () => void
  onDownload: () => void
  resumeData: ResumeData
  templateKey?: string | null
  supportsPhoto?: boolean
  resumeTitle?: string
}

export function PDFPreviewDialog({
  open,
  onClose,
  onDownload,
  resumeData,
  templateKey,
  supportsPhoto = false,
}: PDFPreviewDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      setError(null)
      return
    }

    let cancelled = false
    let createdUrl: string | null = null

    const generatePreview = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/resumes/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: resumeData,
            templateKey,
            supportsPhoto,
          }),
        })

        if (!response.ok) {
          const msg = await response
            .json()
            .then((j) => j?.error)
            .catch(() => null)
          throw new Error(msg || `Preview failed (${response.status})`)
        }

        const blob = await response.blob()
        if (cancelled) return
        createdUrl = URL.createObjectURL(blob)
        setPreviewUrl(createdUrl)
      } catch (err) {
        if (!cancelled) {
          console.error('Preview generation error:', err)
          setError(err instanceof Error ? err.message : 'Failed to generate preview')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    generatePreview()

    return () => {
      cancelled = true
      if (createdUrl) URL.revokeObjectURL(createdUrl)
    }
  }, [open, resumeData, templateKey, supportsPhoto])

  const handleDownload = () => {
    onDownload()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4">
      <Card className="w-full max-w-4xl max-h-[95vh] flex flex-col">
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl">PDF Preview</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Exactly how your resume will look when downloaded
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-4 sm:p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-sm text-gray-600">Generating preview...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
              <p className="text-red-600 mb-4">Error: {error}</p>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          )}

          {previewUrl && !loading && (
            <div className="flex flex-col items-center">
              <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-4 w-full min-h-[500px]">
                <iframe
                  src={previewUrl}
                  title="Resume PDF preview"
                  className="w-full"
                  style={{ height: '70vh', border: 0 }}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button onClick={handleDownload} className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">
                  Close Preview
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
