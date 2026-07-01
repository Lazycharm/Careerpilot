import type React from 'react'
import type { ResumeData } from '@/lib/resume/schema'

export interface TemplateProps {
  data: ResumeData
  /** When true, renders in a mode optimised for Puppeteer PDF output (no transforms, print units). */
  printMode?: boolean
}

export interface HtmlTemplateMeta {
  key: string
  name: string
  category: 'classic' | 'executive' | 'minimal' | 'modern'
  industries: string[]
  isPremium: boolean
  supportsPhoto: boolean
  /** Accent color used for template card thumbnails. */
  accentColor: string
  component: React.ComponentType<TemplateProps>
}
