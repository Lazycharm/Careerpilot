'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/shared/Navbar'
import { Save, Download, Sparkles, TrendingUp, Minus, Plus } from 'lucide-react'

export default function CoverLetterViewPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const letterId = params.id as string

  const [coverLetter, setCoverLetter] = useState<any>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customizing, setCustomizing] = useState<string | null>(null)

  useEffect(() => {
    if (letterId) {
      fetchCoverLetter()
    }
  }, [letterId])

  const fetchCoverLetter = async () => {
    try {
      const response = await fetch(`/api/cover-letters/${letterId}`)
      if (response.ok) {
        const data = await response.json()
        setCoverLetter(data)
        setContent(data.content)
      }
    } catch (error) {
      console.error('Failed to fetch cover letter:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/cover-letters/${letterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (response.ok) {
        alert('Cover letter saved!')
      }
    } catch (error) {
      console.error('Failed to save cover letter:', error)
      alert('Failed to save cover letter')
    } finally {
      setSaving(false)
    }
  }

  const handleCustomize = async (action: 'improve' | 'shorten' | 'elongate') => {
    setCustomizing(action)
    try {
      const response = await fetch(`/api/cover-letters/${letterId}/customize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (response.ok) {
        const data = await response.json()
        setContent(data.content)
        alert(`Cover letter ${action}d successfully!`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to customize cover letter')
      }
    } catch (error) {
      console.error('Failed to customize cover letter:', error)
      alert('Failed to customize cover letter')
    } finally {
      setCustomizing(null)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/cover-letters/${letterId}/export`)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to generate PDF' }))
        alert(error.error || 'Failed to download PDF')
        return
      }

      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('application/pdf')) {
        // PDF download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `cover-letter-${coverLetter?.jobTitle || 'letter'}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else if (contentType?.includes('text/html')) {
        // Fallback: HTML response - use client-side PDF generation
        const htmlContent = await response.text()
        
        // Try to use html2pdf or jsPDF
        try {
          const { default: jsPDF } = await import('jspdf')
          const html2canvas = (await import('html2canvas')).default
          
          // Create a temporary container
          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = htmlContent
          tempDiv.style.position = 'absolute'
          tempDiv.style.left = '-9999px'
          tempDiv.style.width = '8.5in'
          document.body.appendChild(tempDiv)
          
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const canvas = await html2canvas(tempDiv, {
            scale: 2,
            useCORS: true,
            logging: false,
          })
          
          document.body.removeChild(tempDiv)
          
          const imgData = canvas.toDataURL('image/png')
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'in',
            format: 'a4',
          })
          
          const imgWidth = 8.5
          const pageHeight = 11
          const imgHeight = (canvas.height * imgWidth) / canvas.width
          let heightLeft = imgHeight
          let position = 0
          
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
          heightLeft -= pageHeight
          
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight
            pdf.addPage()
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
            heightLeft -= pageHeight
          }
          
          pdf.save(`cover-letter-${coverLetter?.jobTitle || 'letter'}.pdf`)
        } catch (error) {
          console.error('Client-side PDF generation failed:', error)
          // Fallback to text download
          const blob = new Blob([content], { type: 'text/plain' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `cover-letter-${coverLetter?.jobTitle || 'letter'}.txt`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
      } else {
        // Fallback to text download
        const blob = new Blob([content], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `cover-letter-${coverLetter?.jobTitle || 'letter'}.txt`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download cover letter')
    }
  }

  // Parse and format the cover letter content for display (body and footer sectioned)
  const FOOTER_STARTERS = /^(Sincerely|Best regards|Kind regards|Respectfully|Yours sincerely|Regards),?\s*$/i

  const formatCoverLetterContent = (text: string) => {
    const lines = text.split('\n')
    const formattedLines: JSX.Element[] = []
    let headerLines: string[] = []
    let bodyStart = 0
    let inHeader = false

    // Find header section
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line && !inHeader && (line.includes('@') || line.includes('Phone') || line.includes('Email') || line.includes('Location'))) {
        inHeader = true
        headerLines = []
      }
      if (inHeader && line) {
        headerLines.push(line)
        if (i < lines.length - 1 && lines[i + 1].trim() === '') {
          inHeader = false
          bodyStart = i + 1
          break
        }
      }
    }

    // Render header (top right)
    if (headerLines.length > 0) {
      formattedLines.push(
        <div key="header" className="text-right mb-8 space-y-1">
          {headerLines.map((line, idx) => (
            <div key={idx} className={idx === 0 ? 'text-xl font-bold' : 'text-sm text-gray-700'}>
              {line}
            </div>
          ))}
        </div>
      )
    }

    const bodyLines = bodyStart > 0 ? lines.slice(bodyStart) : lines
    let bodyContent: string[] = []
    let footerLines: string[] = []
    let inFooter = false

    for (let i = 0; i < bodyLines.length; i++) {
      const line = bodyLines[i].trim()
      if (FOOTER_STARTERS.test(line)) {
        inFooter = true
        footerLines.push(line)
        continue
      }
      if (inFooter) {
        if (line) footerLines.push(line)
        continue
      }
      bodyContent.push(bodyLines[i])
    }

    // Render body
    let currentParagraph: string[] = []
    bodyContent.forEach((line, idx) => {
      const trimmed = line.trim()
      if (trimmed === '') {
        if (currentParagraph.length > 0) {
          formattedLines.push(
            <p key={`para-${idx}`} className="mb-4 text-gray-800 leading-relaxed">
              {currentParagraph.join(' ')}
            </p>
          )
          currentParagraph = []
        }
      } else if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        formattedLines.push(
          <div key={`bullet-${idx}`} className="mb-2 ml-4 text-gray-800">
            {trimmed}
          </div>
        )
      } else {
        currentParagraph.push(trimmed)
      }
    })
    if (currentParagraph.length > 0) {
      formattedLines.push(
        <p key="last-para" className="mb-4 text-gray-800 leading-relaxed">
          {currentParagraph.join(' ')}
        </p>
      )
    }

    // Render footer as a distinct section (spacing + structure)
    if (footerLines.length > 0) {
      const closing = footerLines.map(l => l.trim()).filter(Boolean)[0] || ''
      const signature = footerLines.map(l => l.trim()).filter(Boolean)[1] || ''
      formattedLines.push(
        <div key="footer" className="mt-10 pt-6 border-t-0">
          <div className="text-gray-800">{closing}</div>
          {signature && <div className="font-semibold text-gray-900 mt-2">{signature}</div>}
        </div>
      )
    }

    return formattedLines.length > 0 ? formattedLines : <div className="whitespace-pre-wrap text-gray-800">{text}</div>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{coverLetter?.jobTitle || 'Cover Letter'}</h1>
            <p className="text-gray-600">{coverLetter?.industry}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* AI Customization Buttons */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Customization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              <Button
                variant="outline"
                onClick={() => handleCustomize('improve')}
                disabled={customizing !== null}
                className="flex-1 min-w-[120px]"
              >
                {customizing === 'improve' ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Improving...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Improve
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCustomize('shorten')}
                disabled={customizing !== null}
                className="flex-1 min-w-[120px]"
              >
                {customizing === 'shorten' ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Shortening...
                  </>
                ) : (
                  <>
                    <Minus className="h-4 w-4 mr-2" />
                    Shorten
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCustomize('elongate')}
                disabled={customizing !== null}
                className="flex-1 min-w-[120px]"
              >
                {customizing === 'elongate' ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Elongating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Elongate
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Use AI to improve, shorten, or expand your cover letter while maintaining professional format
            </p>
          </CardContent>
        </Card>

        {/* Cover Letter Display */}
        <Card>
          <CardHeader>
            <CardTitle>Cover Letter</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Formatted Preview */}
            <div className="bg-white p-8 min-h-[600px] border border-gray-200 rounded-lg mb-4">
              <div className="max-w-2xl mx-auto">
                {formatCoverLetterContent(content)}
              </div>
            </div>

            {/* Editable Textarea */}
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">Edit Content</label>
              <textarea
                className="w-full min-h-[400px] rounded-md border border-input bg-background px-4 py-3 text-sm font-mono"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Cover letter content will appear here..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

