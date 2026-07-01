/**
 * Dubai Classic — ATS-optimized, professional navy blue.
 * Single column, Inter font, clean typographic hierarchy.
 * Category: classic | Ideal for: banking, consulting, corporate
 */
import type { TemplateProps } from '../types'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`

const CSS = `
.rt-c {
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  font-size: 9.5pt;
  line-height: 1.55;
  color: #1f2937;
  background: #ffffff;
  width: 210mm;
  min-height: 297mm;
  padding: 13mm 15mm;
  box-sizing: border-box;
}

/* ── Header ── */
.rt-c-name {
  font-size: 26pt;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.4px;
  line-height: 1.1;
  margin-bottom: 6px;
}
.rt-c-contact {
  display: flex;
  flex-wrap: wrap;
  color: #6b7280;
  font-size: 8.5pt;
  margin-bottom: 0;
  gap: 0;
}
.rt-c-ci + .rt-c-ci::before {
  content: "  ·  ";
  color: #9ca3af;
  white-space: pre;
}
.rt-c-rule {
  border: none;
  border-top: 1.5px solid #1d4ed8;
  margin: 9px 0 0 0;
}

/* ── Sections ── */
.rt-c-section { margin-top: 13px; }
.rt-c-title {
  font-size: 7.5pt;
  font-weight: 700;
  color: #1d4ed8;
  text-transform: uppercase;
  letter-spacing: 1.8px;
  border-bottom: 1px solid #dbeafe;
  padding-bottom: 3px;
  margin-bottom: 8px;
}

/* ── Entry ── */
.rt-c-entry { margin-bottom: 10px; }
.rt-c-entry:last-child { margin-bottom: 0; }
.rt-c-eh {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}
.rt-c-role {
  font-weight: 600;
  font-size: 10pt;
  color: #0f172a;
}
.rt-c-dates {
  font-size: 8pt;
  color: #6b7280;
  white-space: nowrap;
  flex-shrink: 0;
  font-style: italic;
}
.rt-c-org {
  font-size: 9pt;
  color: #4b5563;
  margin-top: 1px;
  font-style: italic;
}
.rt-c-bullets {
  margin: 4px 0 0 15px;
  padding: 0;
  list-style: disc;
  color: #374151;
}
.rt-c-bullets li {
  font-size: 9pt;
  line-height: 1.55;
  margin-bottom: 2px;
}

/* ── Text sections ── */
.rt-c-summary { font-size: 9.5pt; line-height: 1.65; color: #374151; }
.rt-c-skill-row { font-size: 9pt; margin-bottom: 3px; }
.rt-c-skill-cat { font-weight: 600; color: #0f172a; }
.rt-c-langs { font-size: 9pt; color: #4b5563; }
`

export function ClassicTemplate({ data }: TemplateProps) {
  const c = data.customization || {}
  const accent = c.primaryColor || '#1d4ed8'
  const font = c.fontFamily || "'Inter', 'Helvetica Neue', Arial, sans-serif"
  const textColor = c.textColor || '#1f2937'
  const fontSize = c.fontSize ? `${c.fontSize}pt` : '9.5pt'

  const overrides = `
    .rt-c { color: ${textColor}; font-family: ${font}; font-size: ${fontSize}; }
    .rt-c-rule { border-top-color: ${accent}; }
    .rt-c-title { color: ${accent}; border-bottom-color: ${accent}20; }
  `

  const dr = (s: string, e: string | null, cur: boolean) =>
    `${s}${s && (cur || e) ? ' – ' : ''}${cur ? 'Present' : e || ''}`

  const contacts = [
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.location,
    data.personalInfo.linkedIn?.replace(/^https?:\/\//, ''),
    data.personalInfo.website?.replace(/^https?:\/\//, ''),
  ].filter(Boolean) as string[]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONTS + CSS + overrides }} />
      <div className="rt-c">

        {/* Header */}
        <div className="rt-c-name">{data.personalInfo.fullName || 'Your Name'}</div>
        <div className="rt-c-contact">
          {contacts.map((item, i) => (
            <span key={i} className="rt-c-ci">{item}</span>
          ))}
        </div>
        <hr className="rt-c-rule" />

        {/* Summary */}
        {data.summary && (
          <div className="rt-c-section">
            <div className="rt-c-title">Professional Summary</div>
            <p className="rt-c-summary">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.workExperience.length > 0 && (
          <div className="rt-c-section">
            <div className="rt-c-title">Work Experience</div>
            {data.workExperience.map((exp, i) => (
              <div key={i} className="rt-c-entry">
                <div className="rt-c-eh">
                  <span className="rt-c-role">{exp.position || 'Position'}</span>
                  <span className="rt-c-dates">{dr(exp.startDate, exp.endDate, exp.current)}</span>
                </div>
                <div className="rt-c-org">
                  {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                </div>
                {exp.description.filter(Boolean).length > 0 && (
                  <ul className="rt-c-bullets">
                    {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div className="rt-c-section">
            <div className="rt-c-title">Education</div>
            {data.education.map((ed, i) => (
              <div key={i} className="rt-c-entry">
                <div className="rt-c-eh">
                  <span className="rt-c-role">
                    {ed.degree}{ed.field ? `, ${ed.field}` : ''}
                  </span>
                  <span className="rt-c-dates">
                    {ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}
                  </span>
                </div>
                <div className="rt-c-org">
                  {ed.institution}{ed.gpa ? ` · GPA ${ed.gpa}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <div className="rt-c-section">
            <div className="rt-c-title">Skills</div>
            {data.skills.map((g, i) => (
              <div key={i} className="rt-c-skill-row">
                <span className="rt-c-skill-cat">{g.category}: </span>
                <span>{g.items.join(', ')}</span>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <div className="rt-c-section">
            <div className="rt-c-title">Certifications</div>
            {data.certifications.map((cert, i) => (
              <div key={i} className="rt-c-entry">
                <div className="rt-c-eh">
                  <span className="rt-c-role">{cert.name}</span>
                  {cert.date && <span className="rt-c-dates">{cert.date}</span>}
                </div>
                {cert.issuer && <div className="rt-c-org">{cert.issuer}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {data.languages.length > 0 && (
          <div className="rt-c-section">
            <div className="rt-c-title">Languages</div>
            <div className="rt-c-langs">
              {data.languages.map((l) => `${l.language} (${l.proficiency})`).join('   ·   ')}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
