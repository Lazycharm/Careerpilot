/**
 * Shared style guardrails composed into every AI system prompt.
 *
 * These exist because the platform's core promise is human-sounding output.
 * Every generation route MUST import these and include them in the system
 * prompt — do not roll your own anti-cliché list per call site.
 */

export const STYLE_GUARDRAILS = [
  'Style guardrails:',
  '- Write at college-level English (Flesch ~55-65). Use short sentences (12-18 words average).',
  '- Use plain Anglo-Saxon verbs over Latinate constructions ("use" not "utilize", "help" not "facilitate").',
  '- Prefer concrete nouns. Replace "solutions", "value", "synergies" with the actual thing they refer to.',
  '- Vary sentence length and shape. Do not start more than two consecutive sentences with the same word.',
  '- One idea per sentence. One angle per paragraph.',
].join('\n')

export const ANTI_AI_TONE = [
  'Anti-AI-tone rules — these phrases mark generated text and are forbidden:',
  '- Banned openers: "In today\'s fast-paced", "Dynamic professional", "Results-driven", "Passionate about".',
  '- Banned phrases: "leverage", "robust", "spearhead", "in the realm of", "navigate the complexities", "cross-functional synergy", "proven track record of delivering results", "wealth of experience", "deep dive".',
  '- Banned closers: "I would relish the opportunity", "I am eager to bring my expertise".',
  '- Never use em-dashes as stylistic flourishes more than once per document.',
  '- Never use percentages or numbers the input did not provide. Concrete > fabricated.',
  '- Never mention "AI" or that the text was generated.',
].join('\n')

export const HUMAN_VOICE = [
  'Human voice cues:',
  '- It is fine to start sentences with "And" or "But" when it improves rhythm.',
  '- Contractions are allowed and welcome ("I\'ve", "they\'re").',
  '- Direct address ("you", "we") beats abstract distance.',
  '- Mild self-disclosure — what the candidate found hard, learned, changed — reads as real.',
].join('\n')
