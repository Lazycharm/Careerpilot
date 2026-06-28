/**
 * Server-side PDF rendering.
 *
 * Renders a React-PDF Document to a Buffer or Node Readable stream. Designed
 * to run inside Next.js API routes (Node runtime — NOT Edge).
 *
 * Why this exists vs the old html2canvas approach:
 * - True text layer → ATS parsers can read selectable text.
 * - Tiny files (10–60 KB typical) vs multi-MB image PDFs.
 * - Deterministic output across devices.
 * - Multi-page handled by React-PDF automatically.
 */

import { renderToBuffer, renderToStream, type DocumentProps } from '@react-pdf/renderer'
import { getTemplate } from './registry'
import type { ResumeData } from '@/types'
import { createElement, type ReactElement } from 'react'

export interface RenderResumeOptions {
  data: ResumeData
  /** Template key from registry. Falls back to default if unknown. */
  templateKey?: string | null
}

export interface RenderedPDF {
  buffer: Buffer
  bytes: number
  templateKey: string
}

/**
 * Render a resume to a PDF Buffer. Suitable for sending as a Response or
 * uploading to Supabase Storage.
 */
export async function renderResumeBuffer(opts: RenderResumeOptions): Promise<RenderedPDF> {
  const template = getTemplate(opts.templateKey)
  // Templates return a <Document> at the root — cast satisfies @react-pdf's
  // ReactElement<DocumentProps> signature without affecting runtime behavior.
  const element = createElement(template.component, { data: opts.data }) as ReactElement<DocumentProps>
  const buffer = await renderToBuffer(element)
  return { buffer, bytes: buffer.byteLength, templateKey: template.key }
}

/**
 * Render to a streaming response — used by export API to avoid buffering
 * large PDFs in memory.
 */
export async function renderResumeStream(opts: RenderResumeOptions) {
  const template = getTemplate(opts.templateKey)
  const element = createElement(template.component, { data: opts.data }) as ReactElement<DocumentProps>
  const stream = await renderToStream(element)
  return { stream, templateKey: template.key }
}
