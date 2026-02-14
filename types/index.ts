export type UserRole = 'user' | 'admin'

export interface ResumeData {
  personalInfo: {
    fullName: string
    email: string
    phone: string
    location: string
    linkedIn?: string
    website?: string
    photo?: string // Base64 or URL for profile photo
  }
  summary: string
  workExperience: Array<{
    company: string
    position: string
    location: string
    startDate: string
    endDate: string | null
    current: boolean
    description: string[]
  }>
  education: Array<{
    institution: string
    degree: string
    field: string
    startDate: string
    endDate: string
    gpa?: string
  }>
  skills: Array<{
    category: string
    items: string[]
  }>
  certifications: Array<{
    name: string
    issuer: string
    date: string
    expiryDate?: string
  }>
  languages: Array<{
    language: string
    proficiency: string
  }>
  customization?: {
    primaryColor?: string
    secondaryColor?: string
    textColor?: string
    backgroundColor?: string
    fontFamily?: string
    headingFont?: string
    fontSize?: number
    sectionSpacing?: number
    lineHeight?: number
    borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
    borderWidth?: number
    borderRadius?: number
  }
}

export interface InterviewAnalysis {
  score: number
  feedback: string
  strengths?: string[]
  weaknesses?: string[]
}

