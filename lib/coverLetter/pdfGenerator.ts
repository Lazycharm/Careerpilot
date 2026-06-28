/**
 * Cover Letter PDF generator (Phase 1 rewrite).
 *
 * Previous pipeline: fragile regex-based HTML builder → Puppeteer → fly.dev
 * third-party API fallback that exfiltrated PII. All removed.
 *
 * Current pipeline: React-PDF server render via
 * lib/pdf/templates/CoverLetter01_Standard.
 *
 * The legacy `renderCoverLetterToHTML` export remains as a tiny no-op shim so
 * any straggling import doesn't crash — it returns the input text wrapped in a
 * minimal HTML shell. The cover-letter export route no longer uses it.
 */

import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import {
  CoverLetter01_Standard,
  type CoverLetterPDFInput,
} from '@/lib/pdf/templates/CoverLetter01_Standard'

export interface RenderedCoverLetterPDF {
  buffer: Buffer
  bytes: number
}

export async function renderCoverLetterPDF(
  input: CoverLetterPDFInput
): Promise<RenderedCoverLetterPDF> {
  const element = createElement(CoverLetter01_Standard, input) as ReactElement<DocumentProps>
  const buffer = await renderToBuffer(element)
  return { buffer, bytes: buffer.byteLength }
}

/**
 * @deprecated use renderCoverLetterPDF()
 * Returns the content wrapped in minimal HTML. Kept so older imports compile.
 */
export function renderCoverLetterToHTML(content: string): string {
  const esc = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const paragraphs = esc
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('')
  return `<!doctype html><html><head><meta charset="utf-8"><title>Cover Letter</title></head><body>${paragraphs}</body></html>`
}
