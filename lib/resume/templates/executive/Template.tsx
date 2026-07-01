/**
 * Abu Dhabi Executive — Premium serif, centered header, burgundy.
 * Merriweather name + Inter body. Supports optional photo.
 * Category: executive | Ideal for: energy, government, finance, legal
 */
import type { TemplateProps } from '../types'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Inter:wght@400;500;600&display=swap');`

const CSS = `
.rt-e {
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  font-size: 9.5pt;
  line-height: 1.55;
  color: #1e293b;
  background: #ffffff;
  width: 210mm;
  min-height: 297mm;
  padding: 13mm 15mm;
  box-sizing: border-box;
}

/* ── Header ── */
.rt-e-header {
  text-align: center;
  padding-bottom: 10px;
  margin-bottom: 12px;
  border-bottom: 2px solid #7c2d12;
}
.rt-e-header-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}
.rt-e-photo {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fecaca;
  flex-shrink: 0;
}
.rt-e-name {
  font-family: 'Merriweather', Georgia, 'Times New Roman', serif;
  font-size: 27pt;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.2px;
  line-height: 1.1;
  margin-bottom: 6px;
}
.rt-e-contact {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  color: #64748b;
  font-size: 8.5pt;
  gap: 0;
}
.rt-e-contact span + span::before {
  content: "  ·  ";
  color: #cbd5e1;
  white-space: pre;
}

/* ── Sections ── */
.rt-e-section { margin-top: 13px; }
.rt-e-title {
  font-size: 7.5pt;
  font-weight: 600;
  color: #7c2d12;
  text-transform: uppercase;
  letter-spacing: 1.8px;
  padding-bottom: 3px;
  margin-bottom: 8px;
  border-bottom: 0.5px solid #fecaca;
}

/* ── Entry ── */
.rt-e-entry { margin-bottom: 11px; }
.rt-e-entry:last-child { margin-bottom: 0; }
.rt-e-eh {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}
.rt-e-role {
  font-weight: 600;
  font-size: 10pt;
  color: #0f172a;
}
.rt-e-dates {
  font-size: 8pt;
  color: #64748b;
  white-space: nowrap;
  flex-shrink: 0;
  font-style: italic;
}
.rt-e-org {
  font-size: 9pt;
  color: #475569;
  margin-top: 1px;
}
.rt-e-bullets {
  margin: 4px 0 0 15px;
  padding: 0;
  list-style: disc;
  color: #334155;
}
.rt-e-bullets li {
  font-size: 9pt;
  line-height: 1.55;
  margin-bottom: 2px;
}

/* ── Text sections ── */
.rt-e-summary { font-size: 9.5pt; line-height: 1.65; color: #334155; }
.rt-e-skill-row { font-size: 9pt; margin-bottom: 3px; }
.rt-e-skill-cat { font-weight: 600; color: #0f172a; }
.rt-e-langs { font-size: 9pt; color: #475569; }
`

export function ExecutiveTemplate({ data }: TemplateProps) {
  const c = data.customization || {}
  const accent = c.primaryColor || '#7c2d12'
  const font = c.fontFamily || "'Inter', 'Helvetica Neue', Arial, sans-serif"
  const textColor = c.textColor || '#1e293b'
  const fontSize = c.fontSize ? `${c.fontSize}pt` : '9.5pt'

  const overrides = `
    .rt-e { color: ${textColor}; font-family: ${font}; font-size: ${fontSize}; }
    .rt-e-header { border-bottom-color: ${accent}; }
    .rt-e-title { color: ${accent}; border-bottom-color: ${accent}30; }
  `

  const dr = (s: string, e: string | null, cur: boolean) =>
    `${s}${s && (cur || e) ? ' – ' : ''}${cur ? 'Present' : e || ''}`

  const photo = data.personalInfo.photo

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONTS + CSS + overrides }} />
      <div className="rt-e">

        {/* Centered header */}
        <div className="rt-e-header">
          <div className="rt-e-header-inner">
            {photo && <img src={photo} alt="Photo" className="rt-e-photo" />}
            <div>
              <div className="rt-e-name">{data.personalInfo.fullName || 'Your Name'}</div>
              <div className="rt-e-contact">
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
          </div>
        </div>

        {/* Executive Summary */}
        {data.summary && (
          <div className="rt-e-section">
            <div className="rt-e-title">Executive Summary</div>
            <p className="rt-e-summary">{data.summary}</p>
          </div>
        )}

        {/* Professional Experience */}
        {data.workExperience.length > 0 && (
          <div className="rt-e-section">
            <div className="rt-e-title">Professional Experience</div>
            {data.workExperience.map((exp, i) => (
              <div key={i} className="rt-e-entry">
                <div className="rt-e-eh">
                  <span className="rt-e-role">{exp.position || 'Position'}</span>
                  <span className="rt-e-dates">{dr(exp.startDate, exp.endDate, exp.current)}</span>
                </div>
                <div className="rt-e-org">
                  {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                </div>
                {exp.description.filter(Boolean).length > 0 && (
                  <ul className="rt-e-bullets">
                    {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div className="rt-e-section">
            <div className="rt-e-title">Education</div>
            {data.education.map((ed, i) => (
              <div key={i} className="rt-e-entry">
                <div className="rt-e-eh">
                  <span className="rt-e-role">
                    {ed.degree}{ed.field ? `, ${ed.field}` : ''}
                  </span>
                  <span className="rt-e-dates">
                    {ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}
                  </span>
                </div>
                <div className="rt-e-org">
                  {ed.institution}{ed.gpa ? ` · GPA ${ed.gpa}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Core Competencies */}
        {data.skills.length > 0 && (
          <div className="rt-e-section">
            <div className="rt-e-title">Core Competencies</div>
            {data.skills.map((g, i) => (
              <div key={i} className="rt-e-skill-row">
                <span className="rt-e-skill-cat">{g.category}: </span>
                <span>{g.items.join(', ')}</span>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <div className="rt-e-section">
            <div className="rt-e-title">Certifications</div>
            {data.certifications.map((cert, i) => (
              <div key={i} className="rt-e-entry">
                <div className="rt-e-eh">
                  <span className="rt-e-role">{cert.name}</span>
                  {cert.date && <span className="rt-e-dates">{cert.date}</span>}
                </div>
                {cert.issuer && <div className="rt-e-org">{cert.issuer}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {data.languages.length > 0 && (
          <div className="rt-e-section">
            <div className="rt-e-title">Languages</div>
            <div className="rt-e-langs">
              {data.languages.map((l) => `${l.language} (${l.proficiency})`).join('   ·   ')}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
