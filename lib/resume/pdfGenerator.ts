// PDF Generator for Resumes
// Uses jsPDF and html2canvas for client-side PDF generation
// Server-side alternative using Puppeteer can be added later

import type { ResumeData } from '@/types'
import { renderResumeToHTML, type TemplateConfig } from './templateRenderer'

// Client-side PDF generation (for browser)
export async function generateResumePDF(
  data: ResumeData,
  template: TemplateConfig,
  filename: string = 'resume.pdf'
): Promise<Blob> {
  // Dynamic import for client-side only
  const { default: jsPDF } = await import('jspdf')
  const html2canvas = (await import('html2canvas')).default

  // Create a temporary container
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.width = '8.5in'
  container.innerHTML = renderResumeToHTML(data, template)
  document.body.appendChild(container)

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: 816, // 8.5in at 96 DPI
      height: container.scrollHeight,
    })

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: [816, canvas.height * (816 / canvas.width)], // Maintain aspect ratio
    })

    const imgData = canvas.toDataURL('image/png')
    const imgWidth = 816
    const imgHeight = (canvas.height * 816) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)

    // Clean up
    document.body.removeChild(container)

    return pdf.output('blob')
  } catch (error) {
    document.body.removeChild(container)
    throw error
  }
}

// Server-side PDF generation helper (for API routes)
// This would require Puppeteer or similar
export async function generateResumePDFServer(
  data: ResumeData,
  template: TemplateConfig
): Promise<Buffer> {
  // For now, return HTML that can be converted server-side
  // In production, use Puppeteer or similar
  const html = renderResumeToHTML(data, template)
  
  // TODO: Implement server-side PDF generation with Puppeteer
  // For now, this is a placeholder
  throw new Error('Server-side PDF generation not yet implemented. Use client-side generation.')
}

