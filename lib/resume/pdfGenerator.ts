/**
 * Resume PDF generator (Phase 1 rewrite).
 *
 * Previous pipeline: html2canvas → image → jsPDF.addImage()  ── produced
 *   image-only PDFs that no ATS could parse, were 2-10 MB, and rendered
 *   inconsistently across devices. That code path has been removed.
 *
 * Current pipeline: server-side @react-pdf/renderer with template components
 *   from lib/pdf/templates. Output is a real text-layer PDF, ATS-friendly,
 *   typically 10-60 KB, deterministic across devices, with automatic page
 *   breaks and proper font metrics.
 *
 * Public API kept compatible at the call-site level: the export route at
 * app/api/resumes/[id]/export/route.ts calls `generateResumePDFServer(data,
 * template)` and receives a Node Buffer it can send as the response body.
 *
 * Browser callers should fetch the PDF from the export API (`fetch(...).blob()`)
 * rather than generating on the client. Client-side PDF generation has been
 * intentionally removed — see docs/PHASE_1_NOTES.md for the rationale.
 */

import type { ResumeData } from '@/types'
import { renderResumeBuffer, renderResumeStream } from '@/lib/pdf/render'
import { getTemplate, type TemplateMeta } from '@/lib/pdf/registry'

/** Legacy-compatible TemplateConfig type, mapped through the new registry. */
export interface TemplateConfig {
  id: string
  name: string
  supportsPhoto: boolean
  /** Preferred — points to a key in TEMPLATE_REGISTRY. */
  templateKey?: string
  styles?: string
}

/**
 * Server-side render. Returns a Node Buffer suitable for:
 *  - sending as a Next.js Response body (Content-Type: application/pdf)
 *  - uploading to Supabase Storage
 *  - hashing for an export receipt
 */
export async function generateResumePDFServer(
  data: ResumeData,
  template: TemplateConfig
): Promise<Buffer> {
  const meta = resolveTemplate(template)
  const { buffer } = await renderResumeBuffer({ data, templateKey: meta.key })
  return buffer
}

/** Streaming variant — preferred for large multi-page CVs. */
export async function generateResumePDFStream(data: ResumeData, template: TemplateConfig) {
  const meta = resolveTemplate(template)
  return renderResumeStream({ data, templateKey: meta.key })
}

function resolveTemplate(template: TemplateConfig): TemplateMeta {
  return getTemplate(template.templateKey ?? template.id)
}
