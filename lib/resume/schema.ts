import { z } from 'zod'

const PersonalInfoSchema = z.object({
  fullName: z.string().default(''),
  email: z.string().default(''),
  phone: z.string().default(''),
  location: z.string().default(''),
  linkedIn: z.string().optional(),
  website: z.string().optional(),
  photo: z.string().optional(),
})

const WorkExperienceSchema = z.object({
  company: z.string().default(''),
  position: z.string().default(''),
  location: z.string().default(''),
  startDate: z.string().default(''),
  endDate: z.string().nullable().default(null),
  current: z.boolean().default(false),
  description: z.array(z.string()).default([]),
})

const EducationSchema = z.object({
  institution: z.string().default(''),
  degree: z.string().default(''),
  field: z.string().default(''),
  startDate: z.string().default(''),
  endDate: z.string().default(''),
  gpa: z.string().optional(),
})

const SkillGroupSchema = z.object({
  category: z.string().default(''),
  items: z.array(z.string()).default([]),
})

const CertificationSchema = z.object({
  name: z.string().default(''),
  issuer: z.string().default(''),
  date: z.string().default(''),
  expiryDate: z.string().optional(),
})

const LanguageSchema = z.object({
  language: z.string().default(''),
  proficiency: z.string().default(''),
})

const CustomizationSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  textColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  fontFamily: z.string().optional(),
  headingFont: z.string().optional(),
  fontSize: z.number().optional(),
  sectionSpacing: z.number().optional(),
  lineHeight: z.number().optional(),
  borderStyle: z.enum(['solid', 'dashed', 'dotted', 'none']).optional(),
  borderWidth: z.number().optional(),
  borderRadius: z.number().optional(),
})

export const ResumeDataSchema = z.object({
  schemaVersion: z.number().optional(),
  personalInfo: PersonalInfoSchema.default({}),
  summary: z.string().default(''),
  workExperience: z.array(WorkExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  skills: z.array(SkillGroupSchema).default([]),
  certifications: z.array(CertificationSchema).default([]),
  languages: z.array(LanguageSchema).default([]),
  customization: CustomizationSchema.optional(),
})

export type ResumeData = z.infer<typeof ResumeDataSchema>

/**
 * Coerce raw DB JSON (unversioned v0) to a validated ResumeData v1.
 * Missing fields get safe defaults; extra fields are stripped.
 */
export function migrateResumeData(raw: unknown): ResumeData {
  if (!raw || typeof raw !== 'object') return ResumeDataSchema.parse({})
  const result = ResumeDataSchema.safeParse(raw)
  if (result.success) return result.data
  // Partial coercion: apply schema defaults over whatever is present
  return ResumeDataSchema.parse({ schemaVersion: 1, ...raw })
}
