// Legacy AI exports for backward compatibility
// New code should use lib/ai/resumeOptimizer.ts and lib/ai/resumeAssistant.ts

export { optimizeResumeForATS } from './ai/resumeOptimizer'

// Use real OpenAI only when API key is set and demo mode is NOT enabled
const DEMO_MODE = process.env.AI_DEMO_MODE === 'true'

async function callOpenAI(
  messages: { role: string; content: string }[],
  temperature: number
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is not set. Add it to your .env or .env.local file.'
    )
  }
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
      temperature,
      max_tokens: 2000,
    }),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    if (response.status === 429) {
      throw new Error('QUOTA_EXCEEDED')
    }
    throw new Error(
      `OpenAI API error: ${response.status} - ${(err as any).error?.message || response.statusText}`
    )
  }
  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim() || ''
}

export async function generateCoverLetter(
  jobTitle: string,
  industry: string,
  userExperience?: string,
  companyName?: string,
  resumeData?: any,
  contactInfo?: {
    name?: string
    address?: string
    cityCountry?: string
    phone?: string
    email?: string
    date?: string
  },
  companyAddress?: string
): Promise<string> {
  // Demo mode response
  if (DEMO_MODE) {
    const resumeNote = resumeData 
      ? `\n\nNote: Resume data was provided and would be used to personalize this cover letter in production mode.`
      : ''
    
    return `[DEMO MODE - Sample Cover Letter]

Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position${companyName ? ` at ${companyName}` : ''} in the ${industry} industry.

${userExperience || 'With my relevant experience and skills'}, I am confident in my ability to contribute effectively to your team and add value to your organization.

Key highlights:
• Proven track record in ${industry}
• Strong alignment with UAE market requirements
• Dedicated professional approach
• Commitment to excellence

I am excited about the opportunity to bring my expertise to your organization and contribute to its continued success.

Thank you for considering my application.

Best regards,
${resumeData?.personalInfo?.fullName || '[Your Name]'}

Note: This is a demo response. Enable OpenAI API for personalized cover letters.${resumeNote}`
  }

  // Extract contact information - prioritize form input, then resume data
  const personalInfo = resumeData?.personalInfo || {}
  const candidateName = contactInfo?.name || personalInfo.fullName || ''
  const candidateEmail = contactInfo?.email || personalInfo.email || ''
  const candidatePhone = contactInfo?.phone || personalInfo.phone || ''
  const candidateAddress = contactInfo?.address || ''
  const candidateCityCountry = contactInfo?.cityCountry || personalInfo.location || ''
  
  // Format date - use provided date or current date
  const currentDate = contactInfo?.date || new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  // Build contact info string - only include filled fields
  const contactFields: string[] = []
  if (candidateName) contactFields.push(`Name: ${candidateName}`)
  if (candidateAddress) contactFields.push(`Address: ${candidateAddress}`)
  if (candidateCityCountry) contactFields.push(`City, Country: ${candidateCityCountry}`)
  if (candidatePhone) contactFields.push(`Phone: ${candidatePhone}`)
  if (candidateEmail) contactFields.push(`Email: ${candidateEmail}`)
  contactFields.push(`Date: ${currentDate}`)
  
  const contactInfoString = contactFields.length > 0 
    ? contactFields.join('\n')
    : 'Contact information not provided'
  
  // Build resume context if provided
  let resumeContext = ''
  if (resumeData) {
    const summary = resumeData.summary || ''
    const workExp = resumeData.workExperience || []
    const skills = resumeData.skills || []
    const education = resumeData.education || []

    resumeContext = `

CANDIDATE RESUME INFORMATION:
${summary ? `Professional Summary: ${summary}` : ''}

Work Experience:
${workExp.map((exp: any, idx: number) => 
  `${idx + 1}. ${exp.position || 'Position'} at ${exp.company || 'Company'}${exp.location ? ` (${exp.location})` : ''}
     ${exp.startDate || ''} - ${exp.current ? 'Present' : (exp.endDate || '')}
     ${exp.description ? exp.description.map((d: string) => `  • ${d}`).join('\n') : ''}`
).join('\n\n')}

Skills:
${skills.map((skillGroup: any) => 
  `${skillGroup.category || 'Skills'}: ${skillGroup.items?.join(', ') || ''}`
).join('\n')}

Education:
${education.map((edu: any) => 
  `${edu.degree || 'Degree'}${edu.institution ? ` from ${edu.institution}` : ''}${edu.field ? ` in ${edu.field}` : ''}`
).join('\n')}`
  }

  const prompt = `You are a professional resume writer creating a cover letter for a UAE job application. Generate a polished, professional cover letter in UAE format.

JOB DETAILS:
Job Title: ${jobTitle}
Industry: ${industry}
${companyName ? `Company Name: ${companyName}` : 'Company: Not specified'}
${companyAddress ? `Company Address: ${companyAddress}` : companyName ? `Company Location: Dubai, UAE` : 'Company Location: Dubai, UAE'}
${userExperience ? `Candidate Experience Level: ${userExperience}` : ''}${resumeContext}

CANDIDATE CONTACT INFORMATION (ONLY USE FILLED FIELDS - DO NOT USE PLACEHOLDERS):
${contactInfoString}

CRITICAL REQUIREMENTS:
1. ${candidateName ? `Use the EXACT candidate name "${candidateName}"` : 'DO NOT include name in header if not provided'} - do not use placeholders like [Name] or [Your Name]
2. ${candidateEmail ? `Use the EXACT email "${candidateEmail}"` : 'DO NOT include email if not provided'} - do not use [Email Address] or placeholders
3. ${candidatePhone ? `Use the EXACT phone "${candidatePhone}"` : 'DO NOT include phone if not provided'} - do not use [Phone Number] or placeholders
4. ${candidateAddress ? `Use the EXACT address "${candidateAddress}"` : 'DO NOT include address if not provided'} - do not use [Address] placeholder
5. ${candidateCityCountry ? `Use the EXACT location "${candidateCityCountry}"` : 'DO NOT include city/country if not provided'} - do not use [City, Country] placeholder
6. Use the date "${currentDate}" - do not use [Date] placeholder
7. ${companyName ? `Address to: Hiring Manager at ${companyName}` : 'Address to: Hiring Manager'}
8. ${companyAddress ? `Company address: ${companyAddress}` : companyName ? `Company: ${companyName}, Dubai, UAE` : 'Company location: Dubai, UAE'}
9. ONLY INCLUDE FIELDS THAT ARE PROVIDED ABOVE - if a field is empty, do not include it in the cover letter
10. NO PLACEHOLDERS ALLOWED - only use actual values provided above

UAE COVER LETTER FORMAT (EXACT STRUCTURE TO FOLLOW):
1. HEADER SECTION (Top Right Alignment):
   ${candidateName ? `${candidateName}` : ''}
   ${jobTitle ? `${jobTitle}` : ''}
   ${candidatePhone ? `Phone: ${candidatePhone}` : ''}
   ${candidateEmail ? `Email: ${candidateEmail}` : ''}
   ${candidateCityCountry ? `Location: ${candidateCityCountry}` : ''}

2. RECIPIENT SECTION (Left Alignment, Below Header):
   To
   ${companyName ? `${companyName},` : '[Company Name],'}
   ${companyAddress ? `${companyAddress}` : ''}
   
   Dear Hiring Manager,

3. BODY CONTENT:
   - Opening paragraph: Express strong interest in the ${jobTitle} position${companyName ? ` at ${companyName}` : ''}${companyAddress ? ` in ${companyAddress.split(',')[0]}` : ''}. Mention where you found the job listing if relevant.
   - Body paragraphs (2-3): ${resumeData ? 'Reference specific work experience, achievements, and skills from the resume. Use actual company names, positions, and accomplishments. Include quantifiable achievements where possible.' : 'Highlight relevant skills and experience. Be specific about your qualifications.'}
   - Key Skills Section (Optional - use bullet points if space allows):
     * List 3-4 key skills/qualifications relevant to the role
     * Be specific and reference actual experience
   - Closing paragraph: Express enthusiasm for the company and role, request for interview opportunity. End with a sentence like "Thank you for considering my application. I look forward to the possibility of discussing my qualifications further."
   - FOOTER SECTION (must be clearly separated from the body): After the last body paragraph, leave ONE blank line, then write ONLY the closing word (e.g. "Sincerely," or "Best regards,"). Then leave ONE blank line, then on the next line write ONLY the candidate's typed name (e.g. ${candidateName || 'Candidate Name'}). Do not run the closing or signature into the body; they must form a distinct footer section.

CONTENT REQUIREMENTS:
1. Professional, polished, and business-appropriate tone suitable for UAE job market
2. UAE work culture appropriate - show cultural awareness
3. ${resumeData ? 'Reference 2-3 specific achievements or experiences from the resume with actual details, company names, and quantifiable results' : 'Highlight relevant qualifications with specific examples'}
4. Show genuine enthusiasm for the role and company
5. 350-450 words total (excluding header and closing)
6. No generic phrases - be specific and authentic
7. ${resumeData ? 'Mention actual companies worked for, positions held, and specific accomplishments with metrics' : 'Be compelling and professional with concrete examples'}
8. Avoid clichés and overused phrases
9. Include a brief mention of why you're interested in working in UAE if relevant

FORMATTING:
- Header: Top right alignment, candidate name bold/larger font, followed by job title, then contact details
- Date: ${currentDate} (can be included in header or before recipient section)
- Single spacing within paragraphs
- Double spacing between paragraphs
- Left-aligned text for body
- Professional, clean layout with ample white space
- Use bullet points for key skills section if included
- FOOTER: The closing ("Sincerely," or "Best regards,") and the candidate's typed name MUST be in a separate section: one blank line after the last body paragraph, then "Sincerely," (or similar), then one blank line, then the name on its own line. Never attach the closing or signature to the end of a body paragraph.

Generate the complete cover letter in UAE format with ALL information filled in (no placeholders):`

  try {
    const systemPrompt = `You are an expert professional resume writer and career consultant specializing in UAE job market applications. Your cover letters are polished, professional, and perfectly formatted. You NEVER use placeholders - you always fill in actual contact information, dates, and details. Your writing is clear, concise, and compelling.`
    
    return await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ], 0.7)
  } catch (error: any) {
    if (error.message === 'QUOTA_EXCEEDED') {
      throw new Error('OpenAI quota exceeded. Add credits at https://platform.openai.com/settings/organization/billing or enable AI_DEMO_MODE=true')
    }
    throw error
  }
}

export async function customizeCoverLetter(
  currentContent: string,
  action: 'improve' | 'shorten' | 'elongate',
  jobTitle: string,
  industry: string
): Promise<string> {
  // Demo mode response
  if (DEMO_MODE) {
    return `[DEMO MODE - ${action.toUpperCase()} Cover Letter]\n\n${currentContent}\n\nNote: This is a demo response. Enable OpenAI API for actual customization.`
  }

  let instruction = ''
  switch (action) {
    case 'improve':
      instruction = `Improve the cover letter by:
- Enhancing clarity and impact
- Making language more professional and compelling
- Strengthening the connection between candidate qualifications and job requirements
- Adding more specific, quantifiable achievements where appropriate
- Improving flow and readability
- Ensuring UAE job market appropriateness
- Maintaining the same length (approximately same word count)
- Preserving all contact information and formatting exactly as provided`
      break
    case 'shorten':
      instruction = `Shorten the cover letter by:
- Condensing content while maintaining key points
- Removing redundant phrases
- Making sentences more concise
- Keeping all essential information (contact details, key achievements, enthusiasm)
- Target: Reduce to approximately 250-300 words (from current length)
- Preserving all contact information and formatting exactly as provided`
      break
    case 'elongate':
      instruction = `Elongate the cover letter by:
- Adding more detail to key achievements and experiences
- Expanding on relevant skills and qualifications
- Including additional specific examples
- Adding more context about interest in the role and company
- Target: Expand to approximately 450-550 words
- Preserving all contact information and formatting exactly as provided`
      break
  }

  const prompt = `You are a professional resume writer specializing in UAE job market applications. ${instruction}

CURRENT COVER LETTER:
${currentContent}

JOB CONTEXT:
Job Title: ${jobTitle}
Industry: ${industry}

CRITICAL REQUIREMENTS:
1. Maintain the exact UAE cover letter format (header top right, recipient section, body, closing)
2. Preserve ALL contact information exactly as shown (name, phone, email, location, date)
3. Keep the same professional tone and style
4. Do NOT change company name, job title, or recipient information
5. Only modify the body content according to the instruction
6. Ensure the result is professional, polished, and suitable for UAE job market
7. NO placeholders - use actual values from the original

Generate the ${action}d cover letter:`

  try {
    const systemPrompt = `You are an expert professional resume writer and career consultant specializing in UAE job market applications. You excel at refining cover letters while maintaining their professional format and all contact information.`
    
    return await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ], 0.7)
  } catch (error: any) {
    if (error.message === 'QUOTA_EXCEEDED') {
      throw new Error('OpenAI quota exceeded. Add credits at https://platform.openai.com/settings/organization/billing or enable AI_DEMO_MODE=true')
    }
    throw error
  }
}

export async function generateInterviewQuestions(
  jobTitle: string,
  industry: string,
  experienceLevel: string,
  count: number = 10
): Promise<string[]> {
  // Demo mode response
  if (DEMO_MODE) {
    return [
      `Tell me about your experience in ${industry} and how it relates to this ${jobTitle} position.`,
      'How do you handle working in a multicultural environment like the UAE?',
      'Describe a challenging project you worked on and how you overcame obstacles.',
      'What are your salary expectations and notice period?',
      'How do you prioritize tasks when managing multiple deadlines?',
      'Can you give an example of a time you worked effectively in a team?',
      'What interests you most about working in the UAE market?',
      'How do you stay updated with industry trends and developments?',
      'Describe a situation where you had to adapt to significant changes at work.',
      'What are your long-term career goals and how does this role fit into them?',
    ].slice(0, count)
  }

  const prompt = `Generate ${count} relevant interview questions for a ${experienceLevel} level ${jobTitle} position in the ${industry} industry in UAE.

Include:
- UAE-specific work culture questions
- Industry-relevant technical questions
- Behavioral questions
- Questions about working in UAE

Return only the questions, one per line, numbered.`

  try {
    const content = await callOpenAI([{ role: 'user', content: prompt }], 0.7)
    
    return content
      .split('\n')
      .filter(line => line.trim() && /^\d+\./.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(q => q.length > 0)
  } catch (error: any) {
    if (error.message === 'QUOTA_EXCEEDED') {
      throw new Error('OpenAI quota exceeded. Add credits at https://platform.openai.com/settings/organization/billing or enable AI_DEMO_MODE=true')
    }
    throw error
  }
}

export async function analyzeInterviewAnswer(
  question: string,
  answer: string,
  jobTitle: string,
  industry: string
): Promise<{ score: number; feedback: string }> {
  // Demo mode response
  if (DEMO_MODE) {
    const wordCount = answer.split(' ').length
    const hasExample = answer.toLowerCase().includes('example') || answer.toLowerCase().includes('experience')
    const score = Math.min(85, 50 + wordCount + (hasExample ? 15 : 0))
    
    return {
      score,
      feedback: `[DEMO MODE Analysis]

Strengths:
• Good answer length and structure
• ${hasExample ? 'Includes specific examples' : 'Shows understanding of the question'}
• Relevant to ${industry} industry

Areas for improvement:
• Consider adding more specific metrics or results
• Emphasize UAE market relevance
• Include more technical details related to ${jobTitle}

Overall: Your answer demonstrates ${score >= 70 ? 'strong' : 'good'} understanding. ${score >= 70 ? 'Well done!' : 'Keep practicing!'}

Note: This is a demo analysis. Enable OpenAI API for detailed AI feedback.`
    }
  }

  const prompt = `Analyze this interview answer for a ${jobTitle} position in ${industry} (UAE context).

Question: ${question}
Answer: ${answer}

Provide:
1. A score from 0-100
2. Detailed feedback on strengths and weaknesses
3. Suggestions for improvement

Format as JSON:
{
  "score": <number>,
  "feedback": "<detailed feedback>"
}`

  try {
    const content = await callOpenAI([{ role: 'user', content: prompt }], 0.5)

    try {
      const result = JSON.parse(content || '{}')
      return {
        score: Math.min(100, Math.max(0, result.score || 50)),
        feedback: result.feedback || 'No feedback available',
      }
    } catch {
      return {
        score: 50,
        feedback: 'Unable to analyze answer',
      }
    }
  } catch (error: any) {
    if (error.message === 'QUOTA_EXCEEDED') {
      throw new Error('OpenAI quota exceeded. Add credits at https://platform.openai.com/settings/organization/billing or enable AI_DEMO_MODE=true')
    }
    throw error
  }
}

