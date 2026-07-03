/**
 * UAE Government — Formal dark blue, centered emblem-style header, structured.
 * Category: classic | Ideal for: public sector, government, semi-government entities
 */
import type { TemplateProps } from '../types'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`

const CSS = `
.rt-ugv {
  font-family:'Inter','Helvetica Neue',Arial,sans-serif;
  font-size:9.5pt;
  line-height:1.6;
  color:#1e293b;
  background:#ffffff;
  width:210mm;
  min-height:297mm;
  padding:13mm 15mm;
  box-sizing:border-box;
}
.rt-ugv-header { text-align:center; border-bottom:3px double #1e3a5f; padding-bottom:12px; margin-bottom:14px; }
.rt-ugv-name { font-size:24pt; font-weight:700; color:#0f172a; letter-spacing:0.3px; line-height:1.1; margin-bottom:5px; }
.rt-ugv-contact { display:flex; flex-wrap:wrap; justify-content:center; gap:0; font-size:8.5pt; color:#475569; }
.rt-ugv-ci+.rt-ugv-ci::before { content:" | "; color:#94a3b8; }
.rt-ugv-section { margin-top:14px; }
.rt-ugv-stitle { font-size:8pt; font-weight:700; color:#fff; background:#1e3a5f; text-transform:uppercase; letter-spacing:1.5px; padding:3px 8px; margin-bottom:8px; display:inline-block; }
.rt-ugv-entry { margin-bottom:10px; }
.rt-ugv-entry:last-child { margin-bottom:0; }
.rt-ugv-eh { display:flex; justify-content:space-between; align-items:baseline; gap:8px; }
.rt-ugv-role { font-weight:600; font-size:10pt; color:#0f172a; }
.rt-ugv-dates { font-size:8pt; color:#64748b; white-space:nowrap; flex-shrink:0; font-style:italic; }
.rt-ugv-org { font-size:9pt; color:#334155; margin-top:1px; font-weight:500; }
.rt-ugv-bullets { margin:4px 0 0 15px; padding:0; list-style:disc; color:#374151; }
.rt-ugv-bullets li { font-size:9pt; line-height:1.6; margin-bottom:2px; }
.rt-ugv-summary { font-size:9.5pt; line-height:1.65; color:#334155; }
.rt-ugv-skill-row { font-size:9pt; margin-bottom:3px; }
.rt-ugv-skill-cat { font-weight:600; color:#0f172a; }
.rt-ugv-langs { font-size:9pt; color:#475569; }
`

export function UAEGovernmentTemplate({ data }: TemplateProps) {
  const c = data.customization || {}
  const accent = c.primaryColor || '#1e3a5f'
  const font = c.fontFamily || "'Inter','Helvetica Neue',Arial,sans-serif"
  const textColor = c.textColor || '#1e293b'
  const fontSize = c.fontSize ? `${c.fontSize}pt` : '9.5pt'

  const overrides = `
    .rt-ugv { color:${textColor}; font-family:${font}; font-size:${fontSize}; }
    .rt-ugv-header { border-bottom-color:${accent}; }
    .rt-ugv-stitle { background:${accent}; }
  `

  const dr = (s: string, e: string | null, cur: boolean) =>
    `${s}${s && (cur || e) ? ' – ' : ''}${cur ? 'Present' : e || ''}`

  const contacts = [
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.location,
    data.personalInfo.linkedIn?.replace(/^https?:\/\//, ''),
  ].filter(Boolean) as string[]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONTS + CSS + overrides }} />
      <div className="rt-ugv">
        <div className="rt-ugv-header">
          <div className="rt-ugv-name">{data.personalInfo.fullName || 'Your Name'}</div>
          <div className="rt-ugv-contact">
            {contacts.map((item, i) => <span key={i} className="rt-ugv-ci">{item}</span>)}
          </div>
        </div>

        {data.summary && (
          <div className="rt-ugv-section">
            <div className="rt-ugv-stitle">Objective</div>
            <p className="rt-ugv-summary">{data.summary}</p>
          </div>
        )}

        {data.workExperience.length > 0 && (
          <div className="rt-ugv-section">
            <div className="rt-ugv-stitle">Work Experience</div>
            {data.workExperience.map((exp, i) => (
              <div key={i} className="rt-ugv-entry">
                <div className="rt-ugv-eh">
                  <span className="rt-ugv-role">{exp.position || 'Position'}</span>
                  <span className="rt-ugv-dates">{dr(exp.startDate, exp.endDate, exp.current)}</span>
                </div>
                <div className="rt-ugv-org">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                {exp.description.filter(Boolean).length > 0 && (
                  <ul className="rt-ugv-bullets">
                    {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="rt-ugv-section">
            <div className="rt-ugv-stitle">Education</div>
            {data.education.map((ed, i) => (
              <div key={i} className="rt-ugv-entry">
                <div className="rt-ugv-eh">
                  <span className="rt-ugv-role">{ed.degree}{ed.field ? `, ${ed.field}` : ''}</span>
                  <span className="rt-ugv-dates">{ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}</span>
                </div>
                <div className="rt-ugv-org">{ed.institution}{ed.gpa ? ` · GPA ${ed.gpa}` : ''}</div>
              </div>
            ))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="rt-ugv-section">
            <div className="rt-ugv-stitle">Skills</div>
            {data.skills.map((g, i) => (
              <div key={i} className="rt-ugv-skill-row">
                <span className="rt-ugv-skill-cat">{g.category}: </span>
                <span>{g.items.join(', ')}</span>
              </div>
            ))}
          </div>
        )}

        {data.certifications.length > 0 && (
          <div className="rt-ugv-section">
            <div className="rt-ugv-stitle">Certifications</div>
            {data.certifications.map((cert, i) => (
              <div key={i} className="rt-ugv-entry">
                <div className="rt-ugv-eh">
                  <span className="rt-ugv-role">{cert.name}</span>
                  {cert.date && <span className="rt-ugv-dates">{cert.date}</span>}
                </div>
                {cert.issuer && <div className="rt-ugv-org">{cert.issuer}</div>}
              </div>
            ))}
          </div>
        )}

        {data.languages.length > 0 && (
          <div className="rt-ugv-section">
            <div className="rt-ugv-stitle">Languages</div>
            <div className="rt-ugv-langs">
              {data.languages.map((l) => `${l.language} (${l.proficiency})`).join('   ·   ')}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
