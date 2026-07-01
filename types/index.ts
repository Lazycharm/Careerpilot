export type UserRole = 'user' | 'admin'

// ResumeData is now defined and validated by the Zod schema.
// All consumers import from @/types as before — no call-site changes needed.
export type { ResumeData } from '@/lib/resume/schema'

export interface InterviewAnalysis {
  score: number
  feedback: string
  strengths?: string[]
  weaknesses?: string[]
}

