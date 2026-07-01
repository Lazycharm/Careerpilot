'use client'

/**
 * ResumePreview (Phase 2)
 *
 * Renders the actual HTML template component scaled to fit any container,
 * using transform: scale() — identical output to the PDF download.
 * No more parallel CSS system; the same React component serves both preview
 * and Puppeteer export.
 */

import { useEffect, useRef, useState, createElement } from 'react'
import { getHtmlTemplate } from '@/lib/resume/templates/registry'
import type { ResumeData } from '@/types'

// A4 at 96 dpi
const A4_WIDTH_PX = 794
const A4_HEIGHT_PX = 1123

interface ResumePreviewProps {
  data: ResumeData
  templateKey?: string | null
  /** Override computed scale (0–1). Useful for thumbnail cards. */
  scale?: number
  /** Extra class applied to the outer wrapper. */
  className?: string
  supportsPhoto?: boolean // kept for API compat; not used directly
}

export function ResumePreview({
  data,
  templateKey,
  scale: scaleProp,
  className = '',
}: ResumePreviewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(scaleProp ?? 1)

  useEffect(() => {
    if (scaleProp !== undefined) {
      setScale(scaleProp)
      return
    }
    const el = wrapperRef.current
    if (!el) return
    const compute = () => setScale(el.clientWidth / A4_WIDTH_PX)
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [scaleProp])

  const meta = getHtmlTemplate(templateKey)
  const TemplateComponent = meta.component

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden bg-white ${className}`}
      style={{ width: '100%', height: A4_HEIGHT_PX * scale }}
    >
      <div
        style={{
          width: A4_WIDTH_PX,
          height: A4_HEIGHT_PX,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {createElement(TemplateComponent, { data })}
      </div>
    </div>
  )
}

/**
 * Mini thumbnail variant — fixed scale for template selector cards.
 */
export function ResumePreviewThumbnail({
  data,
  templateKey,
  width = 200,
}: {
  data: ResumeData
  templateKey?: string | null
  width?: number
}) {
  const thumbScale = width / A4_WIDTH_PX
  return (
    <ResumePreview
      data={data}
      templateKey={templateKey}
      scale={thumbScale}
      className="rounded shadow-sm border border-gray-100"
    />
  )
}
