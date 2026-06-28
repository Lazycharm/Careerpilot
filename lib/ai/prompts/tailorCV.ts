/**
 * Tailored CV prompts.
 *
 * Generates a structured set of edits to apply on top of an existing
 * ResumeData, optimised for a specific Company + role. We do NOT ask the
 * model to regenerate the whole resume — we ask for a delta (replace
 * summary, swap selected bullets, add keywords) so we don't blow away
 * the user's authored content.
 *
 * Style guardrails + anti-AI tone block from lib/ai/prompts/style.ts are
 * composed into the system prompt, matching the cover-letter pipeline.
 */

import { STYLE_GUARDRAILS, ANTI_AI_TONE } from './style'

export interface TailorCVInput {
  candidateName: string
  candidateLocation?: string
  candidateSummary?: string
  candidateExperience?: string
  candidateSkills?: string[]
  jobTitle: string
  industry: string
  companyName: string
  companyDescription?: string
  jobDescription?: string
  language?: 'en' | 'ar'
}

/** Shape the model must respond with. Keep the schema small and explicit. */
export interface TailorCVOutput {
  summary?: string
  workExperience?: Array<{
    matchOn: { company?: string; position?: string }
    bullets?: string[]
  }>
  addSkills?: string[]
  rationale?: string
}

export function tailorCVSystemPrompt(): string {
  return [
    "You are an experienced UAE recruiter who tailors candidates' CVs for a specific company without inventing facts.",
    'Rules:',
    '- Only adjust phrasing of what the candidate already provided. Do NOT invent metrics, projects, certifications, or employers.',
    '- Prefer 3–5 outcome-led bullets per role you touch. Each bullet starts with a strong verb.',
    '- Mirror the target company\'s vocabulary where it overlaps with the candidate\'s real experience.',
    '- If you cannot find an honest angle for a section, omit it from the JSON.',
    STYLE_GUARDRAILS,
    ANTI_AI_TONE,
    '',
    'OUTPUT FORMAT — respond with valid JSON only matching this shape:',
    '{',
    '  "summary": "<optional rewritten summary>",',
    '  "workExperience": [',
    '    {',
    '      "matchOn": { "company": "<exact existing company string>", "position": "<exact existing position string>" },',
    '      "bullets": ["replacement bullet 1", "replacement bullet 2", ...]',
    '    }',
    '  ],',
    '  "addSkills": ["skill 1", "skill 2"],',
    '  "rationale": "<one short paragraph for the user explaining your edits>"',
    '}',
    '',
    'Omit keys you do not want to change. Never emit a section you would have to fabricate.',
  ].join('\n')
}

export function tailorCVUserPrompt(input: TailorCVInput): string {
  const lines: string[] = []
  lines.push(`Candidate name: ${input.candidateName}`)
  if (input.candidateLocation) lines.push(`Candidate location: ${input.candidateLocation}`)
  lines.push(`Target role: ${input.jobTitle}`)
  lines.push(`Target industry: ${input.industry}`)
  lines.push(`Target company: ${input.companyName}`)
  if (input.companyDescription) {
    lines.push(`Company context: ${input.companyDescription}`)
  }
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
  lines.push('Return a JSON edit set per the system prompt. Do not fabricate.')
  return lines.join('\n')
}

/** Defensive JSON parse — strips fences, falls back to no-op edits. */
export function parseTailorCVOutput(text: string): TailorCVOutput {
  const stripped = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
  try {
    const obj = JSON.parse(stripped) as TailorCVOutput
    return {
      summary: typeof obj.summary === 'string' ? obj.summary : undefined,
      workExperience: Array.isArray(obj.workExperience) ? obj.workExperience : undefined,
      addSkills: Array.isArray(obj.addSkills)
        ? obj.addSkills.filter((s) => typeof s === 'string' && s.trim().length > 0)
        : undefined,
      rationale: typeof obj.rationale === 'string' ? obj.rationale : undefined,
    }
  } catch {
    return {}
  }
}

/**
 * Apply an edit set to a structured resume payload. Returns a new object —
 * never mutates the input. We never DROP existing bullets the model didn't
 * touch; we replace bullets only on roles where `matchOn` finds an exact
 * (case-insensitive) hit, leaving other roles untouched.
 */
export function applyTailorEdits<T extends ResumeShape>(resume: T, edits: TailorCVOutput): T {
  const out = structuredClone(resume) as T

  if (edits.summary?.trim()) {
    out.summary = edits.summary.trim()
  }

  if (Array.isArray(edits.workExperience) && Array.isArray(out.workExperience)) {
    for (const e of edits.workExperience) {
      const idx = out.workExperience.findIndex((w: ExperienceShape) =>
        matchExperience(w, e.matchOn)
      )
      if (idx >= 0 && Array.isArray(e.bullets) && e.bullets.length > 0) {
        out.workExperience[idx] = {
          ...out.workExperience[idx],
          description: e.bullets.filter((b) => typeof b === 'string' && b.trim().length > 0),
        }
      }
    }
  }

  if (Array.isArray(edits.addSkills) && edits.addSkills.length > 0) {
    if (!Array.isArray(out.skills) || out.skills.length === 0) {
      out.skills = [{ category: 'Skills', items: edits.addSkills }]
    } else {
      const first = out.skills[0]
      const seen = new Set(first.items.map((s) => s.toLowerCase()))
      for (const s of edits.addSkills) {
        if (!seen.has(s.toLowerCase())) first.items.push(s)
      }
    }
  }

  return out
}

interface ExperienceShape {
  company?: string
  position?: string
  description?: string[]
}
interface ResumeShape {
  summary?: string
  workExperience?: ExperienceShape[]
  skills?: Array<{ category: string; items: string[] }>
}

function matchExperience(
  candidate: ExperienceShape,
  target: { company?: string; position?: string } | undefined
): boolean {
  if (!target) return false
  const c = (candidate.company ?? '').trim().toLowerCase()
  const p = (candidate.position ?? '').trim().toLowerCase()
  const tc = (target.company ?? '').trim().toLowerCase()
  const tp = (target.position ?? '').trim().toLowerCase()
  const companyOK = tc ? c === tc : true
  const positionOK = tp ? p === tp : true
  return companyOK && positionOK && (Boolean(tc) || Boolean(tp))
}
