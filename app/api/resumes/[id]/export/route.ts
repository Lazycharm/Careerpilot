import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPlanType } from '@/lib/subscription'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url)
  const pdfType = searchParams.get('type') || 'a4'
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      )
    }

    const planType = await getPlanType(session.user.id)

    if (planType === 'free') {
      return NextResponse.json(
        { error: 'Download requires a paid plan. Upgrade to download PDFs.' },
        { status: 403 }
      )
    }

    if (planType === 'pay_per_download') {
      const credit = await prisma.download.findFirst({
        where: {
          userId: session.user.id,
          type: 'resume',
          paid: true,
          resumeId: null,
        },
      })
      if (!credit) {
        return NextResponse.json(
          {
            error: 'No download credit. Purchase a download to continue.',
            requiresPayment: true,
          },
          { status: 403 }
        )
      }
      await prisma.download.update({
        where: { id: credit.id },
        data: { resumeId: resume.id },
      })
    }

    if (planType === 'pro' || planType === 'business') {
      await prisma.download.create({
        data: {
          userId: session.user.id,
          resumeId: resume.id,
          type: 'resume',
          paid: true,
        },
      })
    }

    // Get template
    const template = await prisma.resumeTemplate.findUnique({
      where: { id: resume.templateId },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Render HTML for PDF generation
    const { renderResumeToHTML } = await import('@/lib/resume/templateRenderer')
    
    // Get template key from metadata
    const metadata = template.metadata as any
    const templateKey = metadata?.templateKey || null
    
    const templateConfig = {
      id: template.id,
      name: template.name,
      supportsPhoto: template.supportsPhoto || false,
      templateKey: templateKey,
    }

    const resumeData = resume.data as any
    
    // Debug: Log resume data structure
    console.log('Resume data keys:', Object.keys(resumeData || {}))
    console.log('Has summary:', !!resumeData?.summary)
    console.log('Work experience count:', resumeData?.workExperience?.length || 0)
    console.log('Education count:', resumeData?.education?.length || 0)
    console.log('Skills count:', resumeData?.skills?.length || 0)
    
    const html = renderResumeToHTML(resumeData, templateConfig)
    
    // Debug: Check HTML content
    const hasSections = html.includes('resume-section')
    const hasSummary = html.includes('Professional Summary')
    const hasWorkExp = html.includes('Work Experience')
    console.log('HTML check - Has sections:', hasSections, 'Has summary:', hasSummary, 'Has work exp:', hasWorkExp)

    // Generate PDF server-side using Puppeteer
    try {
      const puppeteer = await import('puppeteer')
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--disable-web-security',
        ],
      })
      
      const page = await browser.newPage()
      
      let htmlWithStyles = html
      let pdfOptions: any
      
      // Ensure HTML has proper structure
      if (!html.includes('</head>')) {
        console.error('HTML missing </head> tag')
        throw new Error('Invalid HTML structure')
      }
      
      if (pdfType === 'a4') {
        // A4 Professional PDF - Multi-page with proper margins and page breaks
        htmlWithStyles = html.replace(
          '</head>',
          `<style>
            @page {
              size: A4;
              margin: 0.75in 0.5in;
            }
            * {
              -webkit-user-select: text !important;
              user-select: text !important;
            }
            /* Ensure all content is visible */
            body {
              overflow: visible !important;
              height: auto !important;
            }
            .resume-container {
              padding: 0.5in !important;
              overflow: visible !important;
              height: auto !important;
              min-height: auto !important;
              display: block !important;
            }
            .resume-section {
              page-break-inside: avoid;
              break-inside: avoid;
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
              margin-bottom: 22px !important;
            }
            .section-title {
              page-break-after: avoid;
              break-after: avoid;
              display: block !important;
              visibility: visible !important;
            }
            .section-content {
              display: block !important;
              visibility: visible !important;
            }
            .experience-item,
            .education-item,
            .certification-item {
              page-break-inside: avoid;
              break-inside: avoid;
              display: block !important;
              visibility: visible !important;
            }
            .experience-item + .experience-item,
            .education-item + .education-item {
              page-break-before: auto;
              break-before: auto;
            }
            /* Prevent section titles from being orphaned */
            .section-title + .section-content {
              page-break-before: avoid;
              break-before: avoid;
            }
            .experience-bullets,
            .skills-list {
              display: block !important;
              visibility: visible !important;
            }
            .experience-bullets li,
            .skills-item {
              display: list-item !important;
              visibility: visible !important;
            }
          </style>
          </head>`
        )
        
        // Set larger viewport to ensure all content is visible
        await page.setViewport({
          width: 794, // A4 width at 96 DPI (210mm)
          height: 5000, // Large height to capture all content
          deviceScaleFactor: 2,
        })
        
        pdfOptions = {
          format: 'A4',
          printBackground: true,
          margin: {
            top: '0.75in',
            right: '0.5in',
            bottom: '0.75in',
            left: '0.5in',
          },
          preferCSSPageSize: false,
          displayHeaderFooter: false,
          tagPDF: true,
        }
      } else {
        // Long Scroll PDF - Single continuous page
        htmlWithStyles = html.replace(
          '</head>',
          `<style>
            @page {
              size: auto;
              margin: 0;
            }
            * {
              page-break-inside: avoid !important;
              page-break-before: avoid !important;
              page-break-after: avoid !important;
              break-inside: avoid !important;
              break-before: avoid !important;
              break-after: avoid !important;
              orphans: 999 !important;
              widows: 999 !important;
              -webkit-user-select: text !important;
              user-select: text !important;
            }
            html, body {
              height: auto !important;
              min-height: auto !important;
              max-height: none !important;
              overflow: visible !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .resume-container {
              height: auto !important;
              min-height: auto !important;
              max-height: none !important;
              page-break-inside: avoid !important;
              overflow: visible !important;
              margin: 0 !important;
              padding: 0.5in !important;
            }
            /* Ensure all sections are visible */
            .resume-section {
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
              margin-bottom: 22px !important;
            }
            .section-title {
              display: block !important;
              visibility: visible !important;
            }
            .section-content {
              display: block !important;
              visibility: visible !important;
            }
            .experience-item,
            .education-item,
            .certification-item {
              display: block !important;
              visibility: visible !important;
            }
            .experience-bullets,
            .skills-list {
              display: block !important;
              visibility: visible !important;
            }
            .experience-bullets li,
            .skills-item {
              display: list-item !important;
              visibility: visible !important;
            }
          </style>
          </head>`
        )
        
        await page.setViewport({
          width: 816, // 8.5 inches at 96 DPI
          height: 10000, // Very tall to capture all content
          deviceScaleFactor: 2,
        })
      }
      
      // Debug: Log HTML snippet
      console.log('HTML snippet (first 500 chars):', htmlWithStyles.substring(0, 500))
      console.log('HTML contains resume-container:', htmlWithStyles.includes('resume-container'))
      console.log('HTML contains resume-section:', htmlWithStyles.includes('resume-section'))
      
      // Set content
      await page.setContent(htmlWithStyles, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      })
      
      // Wait for DOM to be fully ready
      await page.evaluate(() => {
        return new Promise((resolve) => {
          if (document.readyState === 'complete') {
            resolve(true)
          } else {
            window.addEventListener('load', () => resolve(true))
            setTimeout(() => resolve(true), 2000)
          }
        })
      })
      
      // Wait for fonts
      await page.evaluate(() => {
        return document.fonts ? document.fonts.ready : Promise.resolve()
      })
      
      // Wait for images
      await page.evaluate(() => {
        return Promise.all(
          Array.from(document.images).map(img => {
            if (img.complete) return Promise.resolve()
            return new Promise((resolve) => {
              img.onload = resolve
              img.onerror = resolve
              setTimeout(resolve, 2000)
            })
          })
        )
      })
      
      // Additional wait for content to render
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Ensure content is visible - check if content exists
      const contentCheck = await page.evaluate(() => {
        const container = document.querySelector('.resume-container')
        const sections = container?.querySelectorAll('.resume-section')
        return {
          containerExists: !!container,
          sectionCount: sections?.length || 0,
          containerHeight: container ? (container as HTMLElement).scrollHeight : 0,
          bodyHeight: document.body.scrollHeight,
        }
      })
      
      console.log('Content check:', contentCheck)
      
      // Take a screenshot for debugging (optional, can remove later)
      if (process.env.NODE_ENV === 'development') {
        await page.screenshot({ path: 'debug-pdf-render.png', fullPage: true }).catch(() => {})
      }
      
      if (!contentCheck.containerExists) {
        throw new Error('Resume container not found in HTML')
      }
      
      if (contentCheck.sectionCount === 0) {
        // Log HTML content for debugging
        const htmlContent = await page.content()
        console.log('HTML length:', htmlContent.length)
        console.log('HTML contains resume-section:', htmlContent.includes('resume-section'))
        console.log('Container HTML snippet:', htmlContent.substring(htmlContent.indexOf('.resume-container'), htmlContent.indexOf('.resume-container') + 500))
        throw new Error(`No resume sections found. Found ${contentCheck.sectionCount} sections. Container height: ${contentCheck.containerHeight}`)
      }
      
      if (pdfType === 'long-scroll') {
        // Calculate content height for long-scroll PDF
        const dimensions = await page.evaluate(() => {
          const container = document.querySelector('.resume-container') as HTMLElement
          const body = document.body
          const html = document.documentElement
          
          const heights = [
            container?.scrollHeight || 0,
            container?.offsetHeight || 0,
            container?.getBoundingClientRect().height || 0,
            body.scrollHeight,
            body.offsetHeight,
            html.scrollHeight,
            html.offsetHeight,
          ]
          
          return Math.max(...heights.filter(h => h > 0)) || 1056
        })
        
        const contentHeightPx = Math.ceil(dimensions * 1.02) // 2% buffer
        
        await page.setViewport({
          width: 816,
          height: contentHeightPx,
          deviceScaleFactor: 2,
        })
        
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const finalHeight = await page.evaluate(() => {
          const container = document.querySelector('.resume-container') as HTMLElement
          return Math.max(
            container?.scrollHeight || 0,
            container?.offsetHeight || 0,
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
          ) || 1056
        })
        
        const marginTop = 36 // 0.5in = 36pt
        const marginBottom = 36
        const marginLeft = 36
        const marginRight = 36
        const pageWidthPt = 612 // 8.5in = 612pt
        const contentHeightPt = Math.ceil(finalHeight * 0.75)
        const totalPageHeightPt = contentHeightPt + marginTop + marginBottom
        
        pdfOptions = {
          width: `${pageWidthPt}pt`,
          height: `${totalPageHeightPt}pt`,
          printBackground: true,
          margin: {
            top: `${marginTop}pt`,
            right: `${marginRight}pt`,
            bottom: `${marginBottom}pt`,
            left: `${marginLeft}pt`,
          },
          preferCSSPageSize: false,
          displayHeaderFooter: false,
          tagPDF: true,
        }
      }
      
      // Generate PDF
      const pdfBuffer = await page.pdf(pdfOptions)
      
      await browser.close()
      
      // Return PDF directly
      const filename = pdfType === 'a4' 
        ? `${resume.title || 'resume'}-professional.pdf`
        : `${resume.title || 'resume'}-web.pdf`
      
      return new NextResponse(Buffer.from(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    } catch (puppeteerError) {
      console.error('Puppeteer PDF generation error:', puppeteerError)
      
      // Fallback: Use free html2pdf.fly.dev API (if Puppeteer fails)
      try {
        // Inject no-page-break CSS into HTML for API
        const htmlForAPI = html.replace(
          '</head>',
          `<style>
            @page { size: auto; margin: 0; }
            * { page-break-inside: avoid !important; page-break-before: avoid !important; page-break-after: avoid !important; }
            html, body { height: auto !important; overflow: visible !important; }
          </style>
          </head>`
        )
        
        const pdfResponse = await fetch('https://html2pdf.fly.dev/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            html: htmlForAPI,
          }),
        })
        
        if (pdfResponse.ok) {
          const pdfBlob = await pdfResponse.arrayBuffer()
          return new NextResponse(Buffer.from(pdfBlob), {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${resume.title || 'resume'}.pdf"`,
            },
          })
        }
      } catch (apiError) {
        console.error('PDF API fallback error:', apiError)
      }
      
      // Final fallback: Return HTML
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `inline; filename="${resume.title}.html"`,
        },
      })
    }
  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

