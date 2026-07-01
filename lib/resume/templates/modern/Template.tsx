/**
 * Gulf Modern — Contemporary Poppins, teal accent, grouped skill pills.
 * Category: modern | Ideal for: hospitality, marketing, retail, creative
 */
import type { TemplateProps } from '../types'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');`

const CSS = `
.rt-mo {
  font-family: 'Poppins', 'Helvetica Neue', Arial, sans-serif;
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
.rt-mo-header {
  padding-bottom: 10px;
  margin-bottom: 12px;
  border-bottom: 2.5px solid #0d9488;
}
.rt-mo-name {
  font-size: 26pt;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.3px;
  line-height: 1.1;
  margin-bottom: 5px;
}
.rt-mo-contact {
  display: flex;
  flex-wrap: wrap;
  color: #6b7280;
  font-size: 8.5pt;
  font-weight: 400;
  gap: 0;
}
.rt-mo-contact span + span::before {
  content: "  ·  ";
  color: #d1d5db;
  white-space: pre;
}

/* ── Sections ── */
.rt-mo-section { margin-top: 13px; }
.rt-mo-title {
  font-size: 8.5pt;
  font-weight: 600;
  color: #0d9488;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  padding-bottom: 3px;
  margin-bottom: 7px;
  border-bottom: 1px solid #ccfbf1;
}

/* ── Entry ── */
.rt-mo-entry { margin-bottom: 10px; }
.rt-mo-entry:last-child { margin-bottom: 0; }
.rt-mo-eh {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}
.rt-mo-role {
  font-weight: 600;
  font-size: 10pt;
  color: #0f172a;
}
.rt-mo-dates {
  font-size: 8pt;
  color: #6b7280;
  white-space: nowrap;
  flex-shrink: 0;
}
.rt-mo-org {
  font-size: 8.5pt;
  color: #4b5563;
  margin-top: 1px;
}
.rt-mo-bullets {
  margin: 4px 0 0 14px;
  padding: 0;
  list-style: disc;
  color: #374151;
}
.rt-mo-bullets li {
  font-size: 9pt;
  line-height: 1.55;
  margin-bottom: 2px;
}

/* ── Summary ── */
.rt-mo-summary { font-size: 9.5pt; line-height: 1.65; color: #374151; }

/* ── Skills — pill style, grouped ── */
.rt-mo-skill-group { margin-bottom: 6px; }
.rt-mo-skill-group-label {
  font-size: 8pt;
  font-weight: 600;
  color: #0d9488;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 4px;
}
.rt-mo-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.rt-mo-pill {
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  border-radius: 3px;
  padding: 2px 8px;
  font-size: 8.5pt;
  color: #0f4c46;
  font-weight: 400;
  white-space: nowrap;
}

/* ── Languages ── */
.rt-mo-langs { font-size: 9pt; color: #4b5563; }
`

export function ModernTemplate({ data }: TemplateProps) {
  const c = data.customization || {}
  const accent = c.primaryColor || '#0d9488'
  const font = c.fontFamily || "'Poppins', 'Helvetica Neue', Arial, sans-serif"
  const textColor = c.textColor || '#1f2937'
  const fontSize = c.fontSize ? `${c.fontSize}pt` : '9.5pt'

  const overrides = `
    .rt-mo { color: ${textColor}; font-family: ${font}; font-size: ${fontSize}; }
    .rt-mo-header { border-bottom-color: ${accent}; }
    .rt-mo-title { color: ${accent}; border-bottom-color: ${accent}20; }
    .rt-mo-skill-group-label { color: ${accent}; }
    .rt-mo-pill { border-color: ${accent}50; background: ${accent}0d; }
  `

  const dr = (s: string, e: string | null, cur: boolean) =>
    `${s}${s && (cur || e) ? ' – ' : ''}${cur ? 'Present' : e || ''}`

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONTS + CSS + overrides }} />
      <div className="rt-mo">

        {/* Header */}
        <div className="rt-mo-header">
          <div className="rt-mo-name">{data.personalInfo.fullName || 'Your Name'}</div>
          <div className="rt-mo-contact">
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
        </div>

        {/* About */}
        {data.summary && (
          <div className="rt-mo-section">
            <div className="rt-mo-title">About</div>
            <p className="rt-mo-summary">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.workExperience.length > 0 && (
          <div className="rt-mo-section">
            <div className="rt-mo-title">Experience</div>
            {data.workExperience.map((exp, i) => (
              <div key={i} className="rt-mo-entry">
                <div className="rt-mo-eh">
                  <span className="rt-mo-role">{exp.position || 'Position'}</span>
                  <span className="rt-mo-dates">{dr(exp.startDate, exp.endDate, exp.current)}</span>
                </div>
                <div className="rt-mo-org">
                  {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                </div>
                {exp.description.filter(Boolean).length > 0 && (
                  <ul className="rt-mo-bullets">
                    {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div className="rt-mo-section">
            <div className="rt-mo-title">Education</div>
            {data.education.map((ed, i) => (
              <div key={i} className="rt-mo-entry">
                <div className="rt-mo-eh">
                  <span className="rt-mo-role">
                    {ed.degree}{ed.field ? `, ${ed.field}` : ''}
                  </span>
                  <span className="rt-mo-dates">
                    {ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}
                  </span>
                </div>
                <div className="rt-mo-org">
                  {ed.institution}{ed.gpa ? ` · GPA ${ed.gpa}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills — grouped pills */}
        {data.skills.length > 0 && (
          <div className="rt-mo-section">
            <div className="rt-mo-title">Skills</div>
            {data.skills.map((g, i) => (
              <div key={i} className="rt-mo-skill-group">
                {g.category && <div className="rt-mo-skill-group-label">{g.category}</div>}
                <div className="rt-mo-pills">
                  {g.items.map((item, j) => (
                    <span key={j} className="rt-mo-pill">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <div className="rt-mo-section">
            <div className="rt-mo-title">Certifications</div>
            {data.certifications.map((cert, i) => (
              <div key={i} className="rt-mo-entry">
                <div className="rt-mo-eh">
                  <span className="rt-mo-role">{cert.name}</span>
                  {cert.date && <span className="rt-mo-dates">{cert.date}</span>}
                </div>
                {cert.issuer && <div className="rt-mo-org">{cert.issuer}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {data.languages.length > 0 && (
          <div className="rt-mo-section">
            <div className="rt-mo-title">Languages</div>
            <div className="rt-mo-langs">
              {data.languages.map((l) => `${l.language} (${l.proficiency})`).join('   ·   ')}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
