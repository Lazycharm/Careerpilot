/**
 * Sharjah Minimal — Pure ATS, ultra-clean black & white.
 * Inter light, no color accent, maximum whitespace.
 * Category: minimal | Ideal for: tech, design, startups
 */
import type { TemplateProps } from '../types'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');`

const CSS = `
.rt-m {
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  font-size: 9.5pt;
  line-height: 1.6;
  color: #111827;
  background: #ffffff;
  width: 210mm;
  min-height: 297mm;
  padding: 13mm 15mm;
  box-sizing: border-box;
}

/* ── Header ── */
.rt-m-name {
  font-size: 24pt;
  font-weight: 600;
  color: #030712;
  letter-spacing: -0.5px;
  line-height: 1.1;
  margin-bottom: 5px;
}
.rt-m-contact {
  display: flex;
  flex-wrap: wrap;
  color: #6b7280;
  font-size: 8.5pt;
  font-weight: 400;
  gap: 0;
}
.rt-m-contact span + span::before {
  content: "  |  ";
  color: #d1d5db;
  white-space: pre;
}
.rt-m-rule {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 9px 0;
}

/* ── Summary ── */
.rt-m-summary {
  font-size: 9.5pt;
  line-height: 1.7;
  color: #374151;
  font-weight: 400;
  border-left: 2px solid #e5e7eb;
  padding-left: 10px;
  margin: 0;
}

/* ── Sections ── */
.rt-m-section { margin-top: 13px; }
.rt-m-title {
  font-size: 7.5pt;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 2px;
  padding-bottom: 4px;
  margin-bottom: 7px;
  border-bottom: 1px solid #f3f4f6;
}

/* ── Entry ── */
.rt-m-entry { margin-bottom: 8px; }
.rt-m-entry:last-child { margin-bottom: 0; }
.rt-m-eh {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}
.rt-m-role {
  font-weight: 500;
  font-size: 9.5pt;
  color: #111827;
}
.rt-m-dates {
  font-size: 8pt;
  color: #9ca3af;
  white-space: nowrap;
  flex-shrink: 0;
}
.rt-m-org {
  font-size: 8.5pt;
  color: #6b7280;
  margin-top: 1px;
}
.rt-m-bullets {
  margin: 3px 0 0 0;
  padding: 0;
  list-style: none;
  color: #4b5563;
}
.rt-m-bullets li {
  font-size: 9pt;
  line-height: 1.55;
  margin-bottom: 2px;
  padding-left: 14px;
  position: relative;
}
.rt-m-bullets li::before {
  content: "–";
  position: absolute;
  left: 0;
  color: #9ca3af;
}

/* ── Skills ── */
.rt-m-skill-row { font-size: 9pt; margin-bottom: 2px; color: #374151; }
.rt-m-skill-cat { font-weight: 500; color: #111827; }
.rt-m-langs { font-size: 9pt; color: #4b5563; }
`

export function MinimalTemplate({ data }: TemplateProps) {
  const c = data.customization || {}
  const font = c.fontFamily || "'Inter', 'Helvetica Neue', Arial, sans-serif"
  const textColor = c.textColor || '#111827'
  const fontSize = c.fontSize ? `${c.fontSize}pt` : '9.5pt'

  const overrides = `
    .rt-m { color: ${textColor}; font-family: ${font}; font-size: ${fontSize}; }
  `

  const dr = (s: string, e: string | null, cur: boolean) =>
    `${s}${s && (cur || e) ? ' – ' : ''}${cur ? 'Present' : e || ''}`

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONTS + CSS + overrides }} />
      <div className="rt-m">

        {/* Header */}
        <div className="rt-m-name">{data.personalInfo.fullName || 'Your Name'}</div>
        <div className="rt-m-contact">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
          {data.personalInfo.linkedIn && (
            <span>{data.personalInfo.linkedIn.replace(/^https?:\/\//, '')}</span>
          )}
          {data.personalInfo.website && (
            <span>{data.personalInfo.website.replace(/^https?:\/\//, '')}</span>
          )}
        </div>
        <hr className="rt-m-rule" />

        {/* Summary — no section heading in minimal style */}
        {data.summary && <p className="rt-m-summary">{data.summary}</p>}

        {/* Experience */}
        {data.workExperience.length > 0 && (
          <div className="rt-m-section">
            <div className="rt-m-title">Experience</div>
            {data.workExperience.map((exp, i) => (
              <div key={i} className="rt-m-entry">
                <div className="rt-m-eh">
                  <span className="rt-m-role">{exp.position || 'Position'}</span>
                  <span className="rt-m-dates">{dr(exp.startDate, exp.endDate, exp.current)}</span>
                </div>
                <div className="rt-m-org">
                  {exp.company}{exp.location ? `  ·  ${exp.location}` : ''}
                </div>
                {exp.description.filter(Boolean).length > 0 && (
                  <ul className="rt-m-bullets">
                    {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div className="rt-m-section">
            <div className="rt-m-title">Education</div>
            {data.education.map((ed, i) => (
              <div key={i} className="rt-m-entry">
                <div className="rt-m-eh">
                  <span className="rt-m-role">
                    {ed.degree}{ed.field ? `, ${ed.field}` : ''}
                  </span>
                  <span className="rt-m-dates">
                    {ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}
                  </span>
                </div>
                <div className="rt-m-org">
                  {ed.institution}{ed.gpa ? `  ·  GPA ${ed.gpa}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <div className="rt-m-section">
            <div className="rt-m-title">Skills</div>
            {data.skills.map((g, i) => (
              <div key={i} className="rt-m-skill-row">
                <span className="rt-m-skill-cat">{g.category}  </span>
                <span>{g.items.join('  ·  ')}</span>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <div className="rt-m-section">
            <div className="rt-m-title">Certifications</div>
            {data.certifications.map((cert, i) => (
              <div key={i} className="rt-m-entry">
                <div className="rt-m-eh">
                  <span className="rt-m-role">{cert.name}</span>
                  {cert.date && <span className="rt-m-dates">{cert.date}</span>}
                </div>
                {cert.issuer && <div className="rt-m-org">{cert.issuer}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {data.languages.length > 0 && (
          <div className="rt-m-section">
            <div className="rt-m-title">Languages</div>
            <div className="rt-m-langs">
              {data.languages.map((l) => `${l.language} (${l.proficiency})`).join('   ·   ')}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
