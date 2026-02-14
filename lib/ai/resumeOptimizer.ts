// Resume Optimizer (Legacy compatibility + Enhanced)
// Provides ATS optimization and keyword matching

import { getAIProvider } from './aiProvider'
import type { ResumeData } from '@/types'

export interface OptimizationParams {
  resumeData: ResumeData
  jobTitle?: string
  industry?: string
  jobDescription?: string
}

// Legacy function for backward compatibility
export async function optimizeResumeForATS(
  resumeContent: string,
  jobTitle?: string,
  industry?: string
): Promise<string> {
  const ai = getAIProvider()
  
  const prompt = `You are an expert ATS (Applicant Tracking System) resume optimizer specializing in UAE job market.
${jobTitle ? `Target job title: ${jobTitle}` : ''}
${industry ? `Industry: ${industry}` : ''}

Optimize the following resume content for UAE ATS systems. Focus on:
1. UAE-relevant keywords
2. ATS-friendly formatting
3. Quantifiable achievements
4. Industry-specific terminology

Resume content:
${resumeContent}

Return only the optimized content without explanations.`

  try {
    const content = await ai.generateText(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
    })
    return content || resumeContent
  } catch (error: any) {
    if (error.message === 'QUOTA_EXCEEDED') {
      throw new Error('OpenAI quota exceeded. Add credits at https://platform.openai.com/settings/organization/billing or enable AI_DEMO_MODE=true')
    }
    throw error
  }
}

// Enhanced optimization with structured data
export async function optimizeResumeData(
  params: OptimizationParams
): Promise<ResumeData> {
  const ai = getAIProvider()
  
  const resumeText = JSON.stringify(params.resumeData, null, 2)
  
  const prompt = `You are an expert ATS resume optimizer for UAE job market. Optimize resume data structure.

${params.jobTitle ? `Target Job Title: ${params.jobTitle}` : ''}
${params.industry ? `Industry: ${params.industry}` : ''}
${params.jobDescription ? `Job Description:\n${params.jobDescription}` : ''}

Current Resume Data:
${resumeText}

Optimize for:
1. ATS keyword matching
2. UAE market relevance
3. Quantifiable achievements
4. Professional language

Return the complete optimized resume data as JSON with the same structure. DO NOT invent or fabricate any information.`

  try {
    const response = await ai.generateText(prompt, {
      temperature: 0.6,
      maxTokens: 3000,
    })
    
    // Parse JSON response
    let optimized: ResumeData
    
    try {
      const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
      optimized = JSON.parse(jsonMatch ? jsonMatch[1] : response)
    } catch {
      // If parsing fails, return original
      return params.resumeData
    }
    
    // Validate structure matches
    if (!optimized.personalInfo || !optimized.workExperience) {
      return params.resumeData
    }
    
    return optimized
  } catch (error: any) {
    if (error.message === 'QUOTA_EXCEEDED') {
      throw new Error('AI quota exceeded. Please add credits or contact support.')
    }
    // On error, return original data
    return params.resumeData
  }
}

