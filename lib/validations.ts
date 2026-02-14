import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const resumeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  templateId: z.string().uuid("Invalid template ID"),
  data: z.record(z.any()),
})

export const coverLetterSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  industry: z.string().min(1, "Industry is required"),
  content: z.string().min(100, "Cover letter must be at least 100 characters"),
})

export const interviewSessionSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  industry: z.string().min(1, "Industry is required"),
  experienceLevel: z.enum(["fresh", "junior", "mid", "senior"]),
})

export const settingSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
  description: z.string().optional(),
})

