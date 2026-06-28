/**
 * Cover letter prompts.
 *
 * Two-stage approach:
 *   1. Request a JSON-structured cover letter (greeting, opening, body[], closing,
 *      sign_off, candidate_signature) so we have predictable downstream rendering
 *      and can run lint passes.
 *   2. Render the JSON into the freeform string the rest of the app expects.
 *
 * Anti-AI tone instructions live in lib/ai/prompts/style.ts and are composed
 * into every system prompt. They are NOT optional — the whole point of this
 * platform is human-sounding output.
 */

import { STYLE_GUARDRAILS, ANTI_AI_TONE } from './style'

export interface CoverLetterPromptInput {
  candidateName: string
  candidateLocation?: string
  candidateSummary?: string
  candidateExperience?: string // structured or freeform text dump from CV
  candidateSkills?: string[]
  jobTitle: string
  industry: string
  companyName?: string
  companyContext?: string // optional notes about the company
  jobDescription?: string
  tone?: 'professional' | 'warm' | 'direct' | 'enthusiastic'
  language?: 'en' | 'ar'
}

export interface CoverLetterJSON {
  greeting: string
  opening: string
  body: string[]
  closing: string
  sign_off: string
  candidate_signature?: string
}

export function coverLetterSystemPrompt(tone: CoverLetterPromptInput['tone']): string {
  const toneLine = TONE_DIRECTIVES[tone ?? 'professional']
  return [
    'You are an experienced UAE recruiter who writes cover letters that get callbacks.',
    'Write in the candidate\'s voice, not as marketing copy.',
    toneLine,
    STYLE_GUARDRAILS,
    ANTI_AI_TONE,
    '',
    'OUTPUT FORMAT — respond with valid JSON only matching this shape:',
    '{',
    '  "greeting": "Dear <name or Hiring Manager>,",',
    '  "opening": "One sentence that opens with substance, not flattery.",',
    '  "body": ["paragraph 1", "paragraph 2", "paragraph 3"],',
    '  "closing": "One sentence asking for next step.",',
    '  "sign_off": "Sincerely,",',
    '  "candidate_signature": "<candidate name>"',
    '}',
    '',
    'Constraints:',
    '- 250–380 words across all body paragraphs combined.',
    '- 2 or 3 body paragraphs, no more.',
    '- Every paragraph must reference a concrete detail (a project, metric, named system, or named function).',
    '- Never use the phrase "I am writing to apply" or "perfect fit" or "passionate about".',
    '- Never invent metrics. If the candidate did not provide one, write qualitatively.',
  ].join('\n')
}

const TONE_DIRECTIVES: Record<NonNullable<CoverLetterPromptInput['tone']>, string> = {
  professional:
    'Tone: professional and grounded. Confident without bravado. Avoid filler phrases.',
  warm: 'Tone: warm and personable. Still substantive. Avoid sentimentality.',
  direct: 'Tone: direct and concise. Skip pleasantries. State value quickly.',
  enthusiastic:
    'Tone: enthusiastic but specific — convey interest by referencing real company context, not adjectives.',
}

export function coverLetterUserPrompt(input: CoverLetterPromptInput): string {
  const lines: string[] = []
  lines.push(`Candidate name: ${input.candidateName}`)
  if (input.candidateLocation) lines.push(`Candidate location: ${input.candidateLocation}`)
  lines.push(`Target role: ${input.jobTitle}`)
  lines.push(`Target industry: ${input.industry}`)
  if (input.companyName) lines.push(`Target company: ${input.companyName}`)
  if (input.companyContext) lines.push(`Company context: ${input.companyContext}`)
  if (input.candidateSummary) lines.push(`Candidate summary: ${input.candidateSummary}`)
  if (input.candidateExperience) {
    lines.push('Candidate experience:')
    lines.push(input.candidateExperience)
  }
  if (input.candidateSkills?.length) {
    lines.push(`Candidate skills: ${input.candidateSkills.join(', ')}`)
  }
  if (input.jobDescription) {
    lines.push('Job description (use to mirror keywords without copy-pasting):')
    lines.push(input.jobDescription)
  }
  lines.push('')
  lines.push('Generate a UAE-recruiter-grade cover letter as JSON per the system prompt.')
  return lines.join('\n')
}

/** Convert the JSON structure into the freeform string the app stores. */
export function renderCoverLetterJSON(json: CoverLetterJSON): string {
  const parts: string[] = []
  if (json.greeting?.trim()) parts.push(json.greeting.trim())
  if (json.opening?.trim()) parts.push(json.opening.trim())
  if (Array.isArray(json.body)) {
    for (const p of json.body) {
      const t = p?.trim()
      if (t) parts.push(t)
    }
  }
  if (json.closing?.trim()) parts.push(json.closing.trim())
  if (json.sign_off?.trim()) {
    const sigBlock = json.candidate_signature?.trim()
      ? `${json.sign_off.trim()}\n${json.candidate_signature.trim()}`
      : json.sign_off.trim()
    parts.push(sigBlock)
  }
  return parts.join('\n\n')
}

/** Best-effort JSON parse with sane fallback so we never crash the caller. */
export function parseCoverLetterJSON(text: string): CoverLetterJSON {
  const trimmed = text.trim()
  // Strip markdown fences if a chatty provider added them.
  const stripped = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
  try {
    const parsed = JSON.parse(stripped) as Partial<CoverLetterJSON>
    return {
      greeting: parsed.greeting ?? 'Dear Hiring Manager,',
      opening: parsed.opening ?? '',
      body: Array.isArray(parsed.body) ? parsed.body : [],
      closing: parsed.closing ?? '',
      sign_off: parsed.sign_off ?? 'Sincerely,',
      candidate_signature: parsed.candidate_signature,
    }
  } catch {
    // Fall back: treat the entire string as a single body paragraph.
    return {
      greeting: 'Dear Hiring Manager,',
      opening: '',
      body: [stripped],
      closing: '',
      sign_off: 'Sincerely,',
    }
  }
}
