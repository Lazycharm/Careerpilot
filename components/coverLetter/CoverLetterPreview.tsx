'use client'

import { useEffect, useRef, useState, createElement } from 'react'
import { getCLTemplate } from '@/lib/coverLetter/templates/registry'
import type { CoverLetterData } from '@/lib/coverLetter/templates/types'

// A4 at 96 dpi
const A4_WIDTH_PX = 794
const A4_HEIGHT_PX = 1123

interface CoverLetterPreviewProps {
  data: CoverLetterData
  templateKey?: string | null
  scale?: number
  className?: string
}

export function CoverLetterPreview({
  data,
  templateKey,
  scale: scaleProp,
  className = '',
}: CoverLetterPreviewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(scaleProp ?? 1)

  useEffect(() => {
    if (scaleProp !== undefined) { setScale(scaleProp); return }
    const el = wrapperRef.current
    if (!el) return
    const compute = () => setScale(el.clientWidth / A4_WIDTH_PX)
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [scaleProp])

  const meta = getCLTemplate(templateKey)
  const TemplateComponent = meta.component

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden bg-white ${className}`}
      style={{ width: '100%', height: A4_HEIGHT_PX * scale }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: A4_WIDTH_PX,
          height: A4_HEIGHT_PX,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <TemplateComponent data={data} />
      </div>
    </div>
  )
}
