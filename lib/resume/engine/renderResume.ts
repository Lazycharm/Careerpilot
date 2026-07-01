/**
 * HTML → PDF render engine (Phase 2).
 *
 * Pipeline:
 *   ResumeData → ReactDOMServer.renderToStaticMarkup() → HTML string
 *     → <style> tags extracted to <head> → Google Fonts as <link> in <head>
 *     → Puppeteer page.setContent() → document.fonts.ready → page.pdf({ format: 'A4' }) → Buffer
 *
 * The template component renders with all styles embedded (<style> tag in body).
 * renderResumeToHTML extracts those styles into <head> so Chromium processes
 * them before the body is painted, fixing the blank-PDF bug caused by Chromium
 * ignoring @import inside <body> style tags.
 */

import { createElement } from 'react'
import { getHtmlTemplate } from '@/lib/resume/templates/registry'
import type { ResumeData } from '@/lib/resume/schema'
import { launchBrowser } from './browser'

const PAGE_RESET = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @page { margin: 0; size: A4; }
  html, body { width: 210mm; background: #fff; }
`

const GOOGLE_IMPORT_RE = /@import\s+url\(['"]?(https:\/\/fonts\.googleapis\.com[^'")\s]+)['"]?\)\s*;?/gi

export function renderResumeToHTML(data: ResumeData, templateKey: string): string {
  // require() is used intentionally here: Next.js's RSC webpack plugin blocks
  // static `import … from 'react-dom/server'` even in server-only API routes.
  const { renderToStaticMarkup } = require('react-dom/server') as typeof import('react-dom/server')
  const meta = getHtmlTemplate(templateKey)
  const bodyRaw = renderToStaticMarkup(createElement(meta.component, { data, printMode: true }))

  // Extract <style> blocks from body → move to <head> so Chromium processes
  // them before layout, and so @import at-rules are actually honoured.
  const styleBlocks: string[] = []
  const bodyNoStyles = bodyRaw.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, css: string) => {
    styleBlocks.push(css)
    return ''
  })

  // Pull Google Fonts @import URLs out of inline CSS and convert them to <link>
  // tags in <head>. Chromium loads <link> stylesheets reliably; @import inside
  // <style> in body is often ignored or loaded after the PDF snapshot.
  const fontUrls: string[] = []
  const cssWithoutImports = styleBlocks.join('\n').replace(GOOGLE_IMPORT_RE, (_, url: string) => {
    fontUrls.push(url)
    return ''
  })

  const fontLinks = fontUrls
    .map(
      (url) =>
        `<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${url}" rel="stylesheet">`
    )
    .join('\n')

  return (
    `<!DOCTYPE html><html lang="en"><head>` +
    `<meta charset="utf-8"/>` +
    fontLinks +
    `<style>${PAGE_RESET}${cssWithoutImports}</style>` +
    `</head><body>${bodyNoStyles}</body></html>`
  )
}

export async function renderResumeToPDF(
  data: ResumeData,
  templateKey: string
): Promise<Buffer> {
  const html = renderResumeToHTML(data, templateKey)
  const browser = await launchBrowser()
  const page = await browser.newPage()

  try {
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 })
    // 'load' fires after stylesheets and scripts are loaded (including <link> fonts)
    await page.setContent(html, { waitUntil: 'load', timeout: 20000 })
    // Wait for the FontFaceSet to settle so glyphs are ready before snapshot
    await page.evaluate(() => (document as any).fonts.ready)
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    })
    return Buffer.from(pdf)
  } finally {
    await page.close()
  }
}
