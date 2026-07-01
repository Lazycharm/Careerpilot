/**
 * Shared content parser for all cover letter templates.
 * Splits raw AI-generated text into structured sections.
 */

export interface ParsedCoverLetter {
  paragraphs: string[]
  closing: string
  signature: string
}

/**
 * Splits cover letter body text into paragraphs and extracts the closing/signature.
 * Works with any AI-generated cover letter format.
 */
export function parseCoverLetterContent(content: string): ParsedCoverLetter {
  const CLOSING_RE = /^(sincerely|best regards|kind regards|respectfully|yours sincerely|regards|warm regards|best),?\s*$/i

  const lines = content.split('\n')
  const paragraphs: string[] = []
  const footerLines: string[] = []
  let inFooter = false
  let currentPara: string[] = []

  for (const raw of lines) {
    const line = raw.trim()
    if (CLOSING_RE.test(line)) { inFooter = true }
    if (inFooter) {
      if (line) footerLines.push(line)
      continue
    }
    if (!line) {
      if (currentPara.length) {
        paragraphs.push(currentPara.join(' '))
        currentPara = []
      }
    } else {
      currentPara.push(line)
    }
  }
  if (currentPara.length) paragraphs.push(currentPara.join(' '))

  return {
    paragraphs,
    closing: footerLines[0] || 'Sincerely,',
    signature: footerLines[1] || '',
  }
}
