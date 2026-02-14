// ATS Optimization Tools
// Provides suggestions and checks for ATS-friendly resume optimization

import type { ResumeData } from '@/types'

export interface ATSSuggestion {
  type: 'keyword' | 'format' | 'content' | 'structure'
  section: string
  message: string
  suggestion: string
  priority: 'high' | 'medium' | 'low'
}

export interface ATSAnalysis {
  score: number
  suggestions: ATSSuggestion[]
  keywordMatches: number
  missingKeywords: string[]
}

// Analyze resume for ATS optimization
export function analyzeATS(resume: ResumeData, jobDescription?: string): ATSAnalysis {
  const suggestions: ATSSuggestion[] = []
  let score = 100
  const missingKeywords: string[] = []
  let keywordMatches = 0

  // Check summary
  if (!resume.summary || resume.summary.trim().length < 50) {
    suggestions.push({
      type: 'content',
      section: 'summary',
      message: 'Professional summary is missing or too short',
      suggestion: 'Add a 3-4 sentence professional summary highlighting your key skills and experience',
      priority: 'high',
    })
    score -= 15
  } else if (resume.summary.length < 100) {
    suggestions.push({
      type: 'content',
      section: 'summary',
      message: 'Professional summary could be more detailed',
      suggestion: 'Expand summary to 3-4 sentences with specific achievements and skills',
      priority: 'medium',
    })
    score -= 5
  }

  // Check for ATS-unfriendly phrases
  const aiPhrases = [
    'results-driven',
    'proven track record',
    'dynamic professional',
    'highly motivated',
    'detail-oriented professional',
    'team player',
  ]
  
  const summaryLower = resume.summary?.toLowerCase() || ''
  aiPhrases.forEach(phrase => {
    if (summaryLower.includes(phrase)) {
      suggestions.push({
        type: 'content',
        section: 'summary',
        message: `Avoid generic phrase: "${phrase}"`,
        suggestion: `Replace with more specific, natural language that describes your actual achievements`,
        priority: 'medium',
      })
      score -= 2
    }
  })

  // Check work experience
  if (resume.workExperience.length === 0) {
    suggestions.push({
      type: 'content',
      section: 'workExperience',
      message: 'No work experience listed',
      suggestion: 'Add at least one work experience entry with detailed bullet points',
      priority: 'high',
    })
    score -= 20
  } else {
    resume.workExperience.forEach((exp, idx) => {
      if (!exp.description || exp.description.length === 0) {
        suggestions.push({
          type: 'content',
          section: `workExperience[${idx}]`,
          message: `Work experience at ${exp.company || 'Company'} has no description`,
          suggestion: 'Add 3-5 achievement-focused bullet points with metrics',
          priority: 'high',
        })
        score -= 10
      } else if (exp.description.length < 3) {
        suggestions.push({
          type: 'content',
          section: `workExperience[${idx}]`,
          message: `Work experience at ${exp.company || 'Company'} needs more detail`,
          suggestion: 'Add more bullet points (3-5 recommended) with quantifiable achievements',
          priority: 'medium',
        })
        score -= 5
      }

      // Check for metrics in descriptions
      const hasMetrics = exp.description.some(desc => 
        /\d+%|\$|\d+\s*(years?|months?|people|team|clients?|projects?)/i.test(desc)
      )
      if (!hasMetrics && exp.description.length > 0) {
        suggestions.push({
          type: 'content',
          section: `workExperience[${idx}]`,
          message: 'Add quantifiable achievements',
          suggestion: 'Include specific numbers, percentages, or metrics in your bullet points (e.g., "Increased sales by 25%", "Managed team of 5")',
          priority: 'high',
        })
        score -= 5
      }
    })
  }

  // Check skills
  if (resume.skills.length === 0) {
    suggestions.push({
      type: 'content',
      section: 'skills',
      message: 'No skills listed',
      suggestion: 'Add relevant skills organized by category (Technical Skills, Soft Skills, etc.)',
      priority: 'high',
    })
    score -= 15
  } else {
    const totalSkills = resume.skills.reduce((sum, group) => sum + (group.items?.length || 0), 0)
    if (totalSkills < 5) {
      suggestions.push({
        type: 'content',
        section: 'skills',
        message: 'Skills section could be more comprehensive',
        suggestion: 'Add more relevant skills (aim for 8-12 total skills)',
        priority: 'medium',
      })
      score -= 5
    }
  }

  // Check education
  if (resume.education.length === 0) {
    suggestions.push({
      type: 'content',
      section: 'education',
      message: 'No education listed',
      suggestion: 'Add your educational background',
      priority: 'medium',
    })
    score -= 10
  }

  // Keyword analysis if job description provided
  if (jobDescription) {
    const jobKeywords = extractKeywords(jobDescription)
    const resumeText = getResumeText(resume)
    const resumeLower = resumeText.toLowerCase()
    
    jobKeywords.forEach(keyword => {
      if (resumeLower.includes(keyword.toLowerCase())) {
        keywordMatches++
      } else {
        missingKeywords.push(keyword)
      }
    })

    const matchPercentage = (keywordMatches / jobKeywords.length) * 100
    if (matchPercentage < 50) {
      suggestions.push({
        type: 'keyword',
        section: 'general',
        message: `Only ${Math.round(matchPercentage)}% of job keywords found in resume`,
        suggestion: `Incorporate missing keywords naturally: ${missingKeywords.slice(0, 5).join(', ')}${missingKeywords.length > 5 ? '...' : ''}`,
        priority: 'high',
      })
      score -= (50 - matchPercentage) / 2
    }
  }

  // Format checks
  if (!resume.personalInfo.fullName || resume.personalInfo.fullName.trim().length === 0) {
    suggestions.push({
      type: 'content',
      section: 'personalInfo',
      message: 'Full name is missing',
      suggestion: 'Add your full name',
      priority: 'high',
    })
    score -= 10
  }

  if (!resume.personalInfo.email || resume.personalInfo.email.trim().length === 0) {
    suggestions.push({
      type: 'content',
      section: 'personalInfo',
      message: 'Email is missing',
      suggestion: 'Add your email address',
      priority: 'high',
    })
    score -= 10
  }

  score = Math.max(0, Math.min(100, score))

  return {
    score: Math.round(score),
    suggestions,
    keywordMatches,
    missingKeywords: missingKeywords.slice(0, 10), // Limit to top 10
  }
}

// Extract keywords from job description
function extractKeywords(text: string): string[] {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
  ])

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word))

  // Count frequency and return most common
  const frequency: Record<string, number> = {}
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1
  })

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word)
}

// Get all text from resume for keyword matching
function getResumeText(resume: ResumeData): string {
  let text = ''
  
  text += resume.summary || ''
  text += ' ' + resume.personalInfo.fullName || ''
  
  resume.workExperience.forEach(exp => {
    text += ' ' + (exp.position || '')
    text += ' ' + (exp.company || '')
    text += ' ' + (exp.description?.join(' ') || '')
  })
  
  resume.skills.forEach(group => {
    text += ' ' + (group.items?.join(' ') || '')
  })
  
  resume.education.forEach(edu => {
    text += ' ' + (edu.degree || '')
    text += ' ' + (edu.institution || '')
    text += ' ' + (edu.field || '')
  })
  
  return text
}

// Get ATS-friendly suggestions based on job description
export function getATSSuggestions(resume: ResumeData, jobDescription: string): ATSSuggestion[] {
  const analysis = analyzeATS(resume, jobDescription)
  return analysis.suggestions
}
