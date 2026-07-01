import type React from 'react'

export interface CoverLetterData {
  content: string
  candidateName?: string
  candidateEmail?: string
  candidatePhone?: string
  candidateLocation?: string
  date?: string
  recipientName?: string
  recipientTitle?: string
  companyName?: string
  companyAddress?: string
  jobTitle?: string
}

export interface CLTemplateProps {
  data: CoverLetterData
  printMode?: boolean
}

export interface CLTemplateMeta {
  key: string
  name: string
  description: string
  accentColor: string
  isPremium: boolean
  component: React.ComponentType<CLTemplateProps>
}
