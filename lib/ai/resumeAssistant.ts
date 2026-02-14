// AI Resume Assistant
// Provides AI-powered assistance for resume sections

import { getAIProvider } from './aiProvider'
import type { ResumeData } from '@/types'

export interface SummaryGenerationParams {
  jobTitle?: string
  industry?: string
  yearsOfExperience?: number
  currentRole?: string
  keySkills?: string[]
}

export interface ExperienceOptimizationParams {
  company: string
  position: string
  currentDescription: string[]
  jobTitle?: string
  industry?: string
}

export interface SkillsSuggestionParams {
  jobTitle?: string
  industry?: string
  currentSkills?: string[]
  experienceLevel?: string
}

export interface TailoringParams {
  jobTitle: string
  jobDescription?: string
  company?: string
  industry?: string
  currentResume: ResumeData
}

// Generate Professional Summary
export async function generateProfessionalSummary(
  params: SummaryGenerationParams
): Promise<string> {
  const ai = getAIProvider()
  
  const prompt = `Write a professional summary for a resume. Make it sound natural and human-written, not AI-generated.

${params.jobTitle ? `Target Job Title: ${params.jobTitle}` : ''}
${params.industry ? `Industry: ${params.industry}` : ''}
${params.yearsOfExperience ? `Years of Experience: ${params.yearsOfExperience}` : ''}
${params.currentRole ? `Current Role: ${params.currentRole}` : ''}
${params.keySkills && params.keySkills.length > 0 ? `Key Skills: ${params.keySkills.join(', ')}` : ''}

Writing Guidelines:
- Write 3-4 sentences that flow naturally
- Use varied sentence structure (mix short and medium sentences)
- Include specific skills and achievements naturally
- Sound like a real person wrote it, not a template
- Avoid phrases like "results-driven", "proven track record", "dynamic professional" - use more natural language
- Include ATS keywords naturally within the text
- UAE job market appropriate
- Write in first person implied (no "I" statements, but natural flow)

Example of good style: "Experienced technician specializing in electrical systems and HVAC maintenance. Successfully reduced equipment downtime by 20% through proactive maintenance schedules. Strong problem-solving skills with a focus on safety compliance and customer satisfaction."

Generate ONLY the summary text, no labels or explanations.`

  const systemPrompt = `You are an expert resume writer. You write professional summaries that sound natural and human-written, not AI-generated. You naturally incorporate ATS keywords while maintaining authentic, conversational tone.`

  try {
    const summary = await ai.generateText(prompt, {
      temperature: 0.7,
      maxTokens: 300,
      systemPrompt,
    })
    
    return summary.trim()
  } catch (error: any) {
    if (error.message === 'QUOTA_EXCEEDED') {
      throw new Error('AI quota exceeded. Please add credits or contact support.')
    }
    throw new Error(`Failed to generate summary: ${error.message}`)
  }
}

// Optimize Work Experience Bullets
export async function optimizeExperienceBullets(
  params: ExperienceOptimizationParams
): Promise<string[]> {
  const ai = getAIProvider()
  
  const currentBullets = params.currentDescription.join('\n')
  
  const prompt = `Rewrite work experience bullet points to sound natural and human-written. Make them achievement-focused and ATS-friendly.

Company: ${params.company}
Position: ${params.position}
${params.jobTitle ? `Target Job: ${params.jobTitle}` : ''}
${params.industry ? `Industry: ${params.industry}` : ''}

Current bullet points:
${currentBullets || 'No description provided yet'}

Writing Guidelines:
- Write 3-5 bullet points that sound natural, not template-like
- Use varied action verbs (avoid repeating "Managed", "Responsible for")
- Include specific numbers/metrics naturally (percentages, dollar amounts, team sizes, timeframes)
- Vary sentence structure and length
- Sound like a real person describing their work, not AI
- Avoid phrases like "successfully", "effectively", "proven ability" - be more direct
- Include ATS keywords naturally
- UAE market appropriate

Example of good style: "Reduced equipment downtime by 20% through regular preventive maintenance" (not "Successfully reduced equipment downtime by 20% through effective preventive maintenance strategies")

Return ONLY the bullet points, one per line. No bullet symbols, no explanations, no numbering.`

  const systemPrompt = `You are a professional resume writer. You write work experience bullet points that sound natural and human-written while being achievement-focused and ATS-optimized. You avoid AI-sounding phrases and write like a real person describing their accomplishments.`

  try {
    const response = await ai.generateText(prompt, {
      temperature: 0.6,
      maxTokens: 500,
      systemPrompt,
    })
    
    // Parse bullets from response
    const bullets = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 5) // Max 5 bullets
    
    return bullets.length > 0 ? bullets : params.currentDescription
  } catch (error: any) {
    if (error.message === 'QUOTA_EXCEEDED') {
      throw new Error('AI quota exceeded. Please add credits or contact support.')
    }
    throw new Error(`Failed to optimize experience: ${error.message}`)
  }
}

// Suggest Skills
export async function suggestSkills(
  params: SkillsSuggestionParams
): Promise<string[]> {
  const ai = getAIProvider()
  
  const prompt = `You are a career advisor specializing in UAE job market. Suggest relevant skills for a resume.

${params.jobTitle ? `Target Job Title: ${params.jobTitle}` : ''}
${params.industry ? `Industry: ${params.industry}` : ''}
${params.experienceLevel ? `Experience Level: ${params.experienceLevel}` : ''}
${params.currentSkills && params.currentSkills.length > 0 ? `Current Skills: ${params.currentSkills.join(', ')}` : ''}

Requirements:
1. Suggest 8-12 relevant skills
2. Mix of technical and soft skills
3. UAE market relevant
4. ATS-friendly keywords
5. Avoid buzzword spam
6. Include industry-specific skills

Return ONLY a comma-separated list of skills. No explanations, no numbering, no bullet points.`

  const systemPrompt = `You are a career advisor with deep knowledge of UAE job market requirements. You suggest practical, relevant skills that help candidates stand out.`

  try {
    const response = await ai.generateText(prompt, {
      temperature: 0.7,
      maxTokens: 200,
      systemPrompt,
    })
    
    // Parse skills from response
    const skills = response
      .split(/[,;]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
      .slice(0, 12) // Max 12 skills
    
    return skills
  } catch (error: any) {
    if (error.message === 'QUOTA_EXCEEDED') {
      throw new Error('AI quota exceeded. Please add credits or contact support.')
    }
    throw new Error(`Failed to suggest skills: ${error.message}`)
  }
}

// Tailor Resume for Job
export async function tailorResumeForJob(
  params: TailoringParams
): Promise<Partial<ResumeData>> {
  const ai = getAIProvider()
  
  const resumeText = JSON.stringify(params.currentResume, null, 2)
  
  const prompt = `Tailor this resume for a specific job application. Make all content sound natural and human-written, not AI-generated.

Job Title: ${params.jobTitle}
${params.company ? `Company: ${params.company}` : ''}
${params.industry ? `Industry: ${params.industry}` : ''}
${params.jobDescription ? `Job Description:\n${params.jobDescription}` : ''}

Current Resume Data:
${resumeText}

Writing Guidelines:
1. Summary: Write 3-4 sentences that flow naturally. Vary sentence structure. Include job-relevant keywords naturally. Sound like a real person, not a template.

2. Work Experience: Write 3-5 bullet points per role that:
   - Use varied action verbs (avoid repetition)
   - Include specific metrics naturally (percentages, numbers, timeframes)
   - Vary sentence length and structure
   - Sound authentic, not AI-generated
   - Match job description keywords naturally

3. Skills: List actual relevant skills based on the job description and existing resume. Use industry-standard skill names.

4. ATS Optimization:
   - Include keywords from job description naturally
   - Use industry-standard terminology
   - Ensure keyword density is appropriate (not keyword stuffing)
   - Match job title variations and synonyms

5. Style Requirements:
   - NO phrases like "results-driven", "proven track record", "dynamic professional"
   - NO repetitive sentence structures
   - NO AI-sounding language
   - Write like a real person describing their experience
   - Use natural, varied language

6. Content Requirements:
   - DO NOT invent companies, dates, or false achievements
   - DO NOT leave blank spaces - fill in ALL content
   - Enhance existing content to be more impactful
   - Base all content on existing resume data

Return a JSON object with ONLY the sections you've improved (summary, workExperience, skills). Use the same structure as the input.`

  const systemPrompt = `You are an expert resume writer specializing in UAE job market and ATS optimization. You write content that sounds natural and human-written, not AI-generated. You naturally incorporate ATS keywords while maintaining authentic tone. You NEVER fabricate information but CAN enhance existing content to be more impactful and ATS-friendly.`

  try {
    const response = await ai.generateText(prompt, {
      temperature: 0.5,
      maxTokens: 2000,
      systemPrompt,
    })
    
    // Try to parse JSON from response
    let tailored: Partial<ResumeData>
    
    try {
      // Extract JSON if wrapped in markdown code blocks
      const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
      tailored = JSON.parse(jsonMatch ? jsonMatch[1] : response)
    } catch {
      // If JSON parsing fails, return minimal changes
      tailored = {}
    }
    
    // Safety: Ensure we don't return fabricated data
    // Only return sections that can be safely modified
    const safeTailored: Partial<ResumeData> = {}
    
    // Summary - ensure it's complete and not empty
    if (tailored.summary && typeof tailored.summary === 'string' && tailored.summary.trim().length > 20) {
      safeTailored.summary = tailored.summary.trim()
    }
    
    if (tailored.skills && Array.isArray(tailored.skills)) {
      // Ensure skills have proper structure: { category: string, items: string[] }
      safeTailored.skills = tailored.skills.map((skill: any) => {
        // Handle different possible formats from AI
        if (typeof skill === 'string') {
          // If AI returns just strings, group them
          return { category: 'Skills', items: [skill] }
        }
        if (skill && typeof skill === 'object') {
          return {
            category: skill.category || 'Skills',
            items: Array.isArray(skill.items) ? skill.items : []
          }
        }
        return { category: 'Skills', items: [] }
      }).filter((skill: any) => skill.items.length > 0) // Remove empty skill groups
    }
    
    // For workExperience, only update descriptions, not company/position
    if (tailored.workExperience && Array.isArray(tailored.workExperience)) {
      safeTailored.workExperience = params.currentResume.workExperience.map((exp, idx) => {
        const tailoredExp = tailored.workExperience?.[idx]
        if (tailoredExp && Array.isArray(tailoredExp.description) && tailoredExp.description.length > 0) {
          // Ensure we have actual content, not empty strings
          const validDescriptions = tailoredExp.description.filter((desc: string) => desc && desc.trim().length > 0)
          if (validDescriptions.length > 0) {
            return {
              ...exp, // Keep original company, position, dates, location
              description: validDescriptions,
            }
          }
        }
        // If no tailored description or empty, keep original but ensure it has content
        if (exp.description && exp.description.length > 0) {
          return exp
        }
        // If original is empty, return empty (don't fabricate)
        return exp
      })
    }
    
    return safeTailored
  } catch (error: any) {
    if (error.message === 'QUOTA_EXCEEDED') {
      throw new Error('AI quota exceeded. Please add credits or contact support.')
    }
    throw new Error(`Failed to tailor resume: ${error.message}`)
  }
}

