/**
 * Cover Letter Template — Standard (Phase 1).
 *
 * One clean, ATS-safe layout that matches the Dubai Classic resume theme so
 * pairings look cohesive. Renders the cover letter's freeform `content` string
 * as paragraphs, with a heading block built from optional contact fields.
 *
 * Phase 2 will add tone-specific variants (executive, modern, minimal).
 */

import { Document, Page, Text, View } from '@react-pdf/renderer'
import { THEMES, buildStyles } from '@/lib/pdf/theme'

export interface CoverLetterPDFInput {
  /** Freeform cover letter body, typically the AI-generated text. */
  content: string
  /** Optional metadata for the document title and header. */
  candidateName?: string
  jobTitle?: string
  companyName?: string
}

export function CoverLetter01_Standard({
  content,
  candidateName,
  jobTitle,
  companyName,
}: CoverLetterPDFInput) {
  const theme = THEMES['dubai-classic']
  const s = buildStyles(theme)

  // Split content into paragraphs, dropping empties. Preserve in-paragraph
  // line breaks by feeding individual lines to <Text> children.
  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  const docTitle = [candidateName, jobTitle && `— ${jobTitle}`].filter(Boolean).join(' ')

  return (
    <Document
      author={candidateName}
      title={docTitle || 'Cover Letter — CareerPilot'}
      creator="CareerPilot"
      producer="CareerPilot"
    >
      <Page size="A4" style={s.page}>
        {(candidateName || jobTitle || companyName) && (
          <View style={{ marginBottom: 12 }}>
            {candidateName && <Text style={s.name}>{candidateName}</Text>}
            {(jobTitle || companyName) && (
              <Text style={s.company}>
                {jobTitle}
                {jobTitle && companyName ? ' — ' : ''}
                {companyName}
              </Text>
            )}
          </View>
        )}

        {paragraphs.map((p, i) => (
          <Text
            key={i}
            style={{
              marginTop: i === 0 ? 0 : theme.spacing.paragraph + 4,
              textAlign: 'justify',
            }}
          >
            {p}
          </Text>
        ))}
      </Page>
    </Document>
  )
}
