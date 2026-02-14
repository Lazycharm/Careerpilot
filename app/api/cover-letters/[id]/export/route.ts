import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPlanType } from '@/lib/subscription'
import { renderCoverLetterToHTML } from '@/lib/coverLetter/pdfGenerator'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
          type: 'cover_letter',
          paid: true,
          resumeId: null,
        },
      })
      if (!credit) {
        return NextResponse.json(
          { error: 'No download credit. Purchase a download to continue.', requiresPayment: true },
          { status: 403 }
        )
      }
      await prisma.download.delete({ where: { id: credit.id } })
    }
    if (planType === 'pro' || planType === 'business') {
      await prisma.download.create({
        data: {
          userId: session.user.id,
          type: 'cover_letter',
          paid: true,
        },
      })
    }

    const coverLetter = await prisma.coverLetter.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!coverLetter) {
      return NextResponse.json(
        { error: 'Cover letter not found' },
        { status: 404 }
      )
    }

    // Generate HTML
    const htmlContent = renderCoverLetterToHTML(coverLetter.content)

    // Try to use Puppeteer for PDF generation
    try {
      const puppeteer = await import('puppeteer')
      const browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })

      const page = await browser.newPage()
      
      // Set A4 page size
      await page.setViewport({
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels
        deviceScaleFactor: 2,
      })

      // Inject CSS for page breaks and styling
      const cssToInject = `
        <style>
          @page {
            size: A4;
            margin: 0.75in 0.5in;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .cover-letter-container {
            page-break-inside: avoid;
          }
          .cover-letter-paragraph {
            page-break-inside: avoid;
            orphans: 3;
            widows: 3;
          }
        </style>
      `

      // Inject CSS into HTML
      const htmlWithCSS = htmlContent.replace('</head>', `${cssToInject}</head>`)

      await page.setContent(htmlWithCSS, {
        waitUntil: 'networkidle0',
      })

      // Wait for fonts and images to load
      await page.evaluate(() => {
        return new Promise<void>((resolve) => {
          if (document.readyState === 'complete') {
            resolve()
          } else {
            window.addEventListener('load', () => resolve())
          }
        })
      })

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '0.75in',
          right: '0.5in',
          bottom: '0.75in',
          left: '0.5in',
        },
        printBackground: true,
        preferCSSPageSize: false,
        displayHeaderFooter: false,
      })

      await browser.close()

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="cover-letter-${coverLetter.jobTitle || 'letter'}.pdf"`,
        },
      })
    } catch (puppeteerError: any) {
      console.error('Puppeteer error:', puppeteerError)
      
      // Fallback: Return HTML for client-side PDF generation or use external API
      try {
        // Try html2pdf.fly.dev API as fallback
        const response = await fetch('https://html2pdf.fly.dev/api/pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            html: htmlContent,
            options: {
              format: 'A4',
              margin: {
                top: '0.75in',
                right: '0.5in',
                bottom: '0.75in',
                left: '0.5in',
              },
            },
          }),
        })

        if (response.ok) {
          const pdfBuffer = await response.arrayBuffer()
          return new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="cover-letter-${coverLetter.jobTitle || 'letter'}.pdf"`,
            },
          })
        }
      } catch (fallbackError) {
        console.error('Fallback PDF generation error:', fallbackError)
      }

      // Last resort: Return HTML
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
        },
      })
    }
  } catch (error: any) {
    console.error('Cover letter export error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to export cover letter' },
      { status: 500 }
    )
  }
}
