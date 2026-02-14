'use client'

import { useState, useEffect, useRef } from 'react'
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
  resumeTitle = 'resume',
}: PDFPreviewDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      setPreviewUrl(null)
      setError(null)
      return
    }

    const generatePreview = async () => {
      setLoading(true)
      setError(null)

      try {
        // Get HTML content from server
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
          throw new Error('Failed to generate preview')
        }

        const htmlContent = await response.text()

        // Create a temporary container for rendering
        const tempContainer = document.createElement('div')
        tempContainer.style.position = 'absolute'
        tempContainer.style.left = '-9999px'
        tempContainer.style.width = '8.5in'
        tempContainer.style.backgroundColor = '#fff'
        tempContainer.innerHTML = htmlContent
        document.body.appendChild(tempContainer)

        // Wait for images and styles to load
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Import html2canvas
        const html2canvas = (await import('html2canvas')).default

        // Generate canvas
        const canvas = await html2canvas(tempContainer, {
          scale: 1.5,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: tempContainer.scrollWidth,
          height: tempContainer.scrollHeight,
        })

        // Clean up
        document.body.removeChild(tempContainer)

        // Convert canvas to image URL
        const imageUrl = canvas.toDataURL('image/png', 0.95)
        setPreviewUrl(imageUrl)
      } catch (err: any) {
        console.error('Preview generation error:', err)
        setError(err.message || 'Failed to generate preview')
      } finally {
        setLoading(false)
      }
    }

    generatePreview()
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
                Preview how your resume will look when downloaded
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
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
              <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-4 w-full">
                <img
                  src={previewUrl}
                  alt="PDF Preview"
                  className="w-full h-auto"
                  style={{ maxWidth: '100%' }}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  onClick={handleDownload}
                  className="w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
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
