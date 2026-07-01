/**
 * Cover Letter HTML → PDF render engine.
 *
 * Same pipeline as lib/resume/engine/renderResume.ts:
 *   CoverLetterData → renderToStaticMarkup → HTML with CSS in <head>
 *     → Puppeteer setContent → document.fonts.ready → page.pdf → Buffer
 *
 * The <style> tags from component bodies are extracted and hoisted to <head>
 * so Chromium processes them before layout, fixing the blank-PDF issue.
 */

import { createElement } from 'react'
import { getCLTemplate } from '@/lib/coverLetter/templates/registry'
import type { CoverLetterData } from '@/lib/coverLetter/templates/types'
import { launchBrowser } from '@/lib/resume/engine/browser'

const PAGE_RESET = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @page { margin: 0; size: A4; }
  html, body { width: 210mm; background: #fff; }
`

const GOOGLE_IMPORT_RE = /@import\s+url\(['"]?(https:\/\/fonts\.googleapis\.com[^'")\s]+)['"]?\)\s*;?/gi

export function renderCoverLetterToHTML(data: CoverLetterData, templateKey: string): string {
  const { renderToStaticMarkup } = require('react-dom/server') as typeof import('react-dom/server')
  const meta = getCLTemplate(templateKey)
  const bodyRaw = renderToStaticMarkup(createElement(meta.component, { data, printMode: true }))

  const styleBlocks: string[] = []
  const bodyNoStyles = bodyRaw.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, css: string) => {
    styleBlocks.push(css)
    return ''
  })

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

export async function renderCoverLetterToPDF(
  data: CoverLetterData,
  templateKey: string
): Promise<Buffer> {
  const html = renderCoverLetterToHTML(data, templateKey)
  const browser = await launchBrowser()
  const page = await browser.newPage()

  try {
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 })
    await page.setContent(html, { waitUntil: 'load', timeout: 20000 })
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
