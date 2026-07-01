'use client'

/**
 * PDFPreviewDialog — renders the live HTML template component directly in a
 * modal (no API call, no blank-screen loading state). The ResumePreview
 * component uses the same render path as the PDF export, so this is true WYSIWYG.
 */

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Download } from 'lucide-react'
import { ResumePreview } from '@/components/resume/ResumePreview'
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
}: PDFPreviewDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4">
      <Card className="w-full max-w-3xl max-h-[95vh] flex flex-col">
        <CardHeader className="flex-shrink-0 pb-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl">Resume Preview</CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">
                Exactly how your PDF will look when downloaded
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 -mr-1">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="flex flex-col items-center gap-4">
            {/* Full A4 preview — auto-scales to modal width via ResizeObserver */}
            <div className="w-full max-w-[560px] shadow-xl rounded overflow-hidden border border-gray-200 bg-white">
              <ResumePreview
                data={resumeData}
                templateKey={templateKey}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={() => { onDownload(); onClose() }}
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">
                Close
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
