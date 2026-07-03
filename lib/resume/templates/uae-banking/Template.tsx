/**
 * UAE Banking — Navy blue, Inter, formal double-rule header.
 * Category: classic | Ideal for: banking, finance, insurance, consulting
 */
import type { TemplateProps } from '../types'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`

const CSS = `
.rt-ub {
  font-family: 'Inter','Helvetica Neue',Arial,sans-serif;
  font-size: 9.5pt;
  line-height: 1.55;
  color: #1e293b;
  background: #ffffff;
  width: 210mm;
  min-height: 297mm;
  padding: 12mm 14mm;
  box-sizing: border-box;
}
.rt-ub-header { text-align:center; padding-bottom:10px; }
.rt-ub-rule1 { border:none; border-top:2.5px solid #1e3a5f; margin:0 0 2px; }
.rt-ub-rule2 { border:none; border-top:1px solid #1e3a5f; margin:0 0 10px; }
.rt-ub-name { font-size:26pt; font-weight:700; color:#0f172a; letter-spacing:-0.3px; line-height:1.1; margin-bottom:6px; }
.rt-ub-title { font-size:10pt; font-weight:500; color:#1e3a5f; letter-spacing:0.5px; margin-bottom:6px; }
.rt-ub-contact { display:flex; flex-wrap:wrap; justify-content:center; gap:0; font-size:8.5pt; color:#64748b; }
.rt-ub-ci+.rt-ub-ci::before { content:" · "; color:#94a3b8; }
.rt-ub-section { margin-top:12px; }
.rt-ub-stitle { font-size:7.5pt; font-weight:700; color:#1e3a5f; text-transform:uppercase; letter-spacing:2px; border-bottom:1.5px solid #1e3a5f; padding-bottom:3px; margin-bottom:8px; }
.rt-ub-entry { margin-bottom:10px; }
.rt-ub-entry:last-child { margin-bottom:0; }
.rt-ub-eh { display:flex; justify-content:space-between; align-items:baseline; gap:8px; }
.rt-ub-role { font-weight:600; font-size:10pt; color:#0f172a; }
.rt-ub-dates { font-size:8pt; color:#64748b; white-space:nowrap; flex-shrink:0; font-style:italic; }
.rt-ub-org { font-size:9pt; color:#475569; margin-top:1px; }
.rt-ub-bullets { margin:4px 0 0 16px; padding:0; list-style:disc; color:#374151; }
.rt-ub-bullets li { font-size:9pt; line-height:1.55; margin-bottom:2px; }
.rt-ub-summary { font-size:9.5pt; line-height:1.65; color:#334155; }
.rt-ub-skill-row { font-size:9pt; margin-bottom:3px; }
.rt-ub-skill-cat { font-weight:600; color:#0f172a; }
.rt-ub-langs { font-size:9pt; color:#475569; }
`

export function UAEBankingTemplate({ data }: TemplateProps) {
  const c = data.customization || {}
  const accent = c.primaryColor || '#1e3a5f'
  const font = c.fontFamily || "'Inter','Helvetica Neue',Arial,sans-serif"
  const textColor = c.textColor || '#1e293b'
  const fontSize = c.fontSize ? `${c.fontSize}pt` : '9.5pt'

  const overrides = `
    .rt-ub { color:${textColor}; font-family:${font}; font-size:${fontSize}; }
    .rt-ub-rule1,.rt-ub-rule2 { border-top-color:${accent}; }
    .rt-ub-title { color:${accent}; }
    .rt-ub-stitle { color:${accent}; border-bottom-color:${accent}; }
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
      <div className="rt-ub">
        <div className="rt-ub-header">
          <div className="rt-ub-name">{data.personalInfo.fullName || 'Your Name'}</div>
          <div className="rt-ub-contact">
            {contacts.map((item, i) => <span key={i} className="rt-ub-ci">{item}</span>)}
          </div>
        </div>
        <hr className="rt-ub-rule1" />
        <hr className="rt-ub-rule2" />

        {data.summary && (
          <div className="rt-ub-section">
            <div className="rt-ub-stitle">Professional Summary</div>
            <p className="rt-ub-summary">{data.summary}</p>
          </div>
        )}

        {data.workExperience.length > 0 && (
          <div className="rt-ub-section">
            <div className="rt-ub-stitle">Work Experience</div>
            {data.workExperience.map((exp, i) => (
              <div key={i} className="rt-ub-entry">
                <div className="rt-ub-eh">
                  <span className="rt-ub-role">{exp.position || 'Position'}</span>
                  <span className="rt-ub-dates">{dr(exp.startDate, exp.endDate, exp.current)}</span>
                </div>
                <div className="rt-ub-org">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                {exp.description.filter(Boolean).length > 0 && (
                  <ul className="rt-ub-bullets">
                    {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="rt-ub-section">
            <div className="rt-ub-stitle">Education</div>
            {data.education.map((ed, i) => (
              <div key={i} className="rt-ub-entry">
                <div className="rt-ub-eh">
                  <span className="rt-ub-role">{ed.degree}{ed.field ? `, ${ed.field}` : ''}</span>
                  <span className="rt-ub-dates">{ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}</span>
                </div>
                <div className="rt-ub-org">{ed.institution}{ed.gpa ? ` · GPA ${ed.gpa}` : ''}</div>
              </div>
            ))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="rt-ub-section">
            <div className="rt-ub-stitle">Skills</div>
            {data.skills.map((g, i) => (
              <div key={i} className="rt-ub-skill-row">
                <span className="rt-ub-skill-cat">{g.category}: </span>
                <span>{g.items.join(', ')}</span>
              </div>
            ))}
          </div>
        )}

        {data.certifications.length > 0 && (
          <div className="rt-ub-section">
            <div className="rt-ub-stitle">Certifications</div>
            {data.certifications.map((cert, i) => (
              <div key={i} className="rt-ub-entry">
                <div className="rt-ub-eh">
                  <span className="rt-ub-role">{cert.name}</span>
                  {cert.date && <span className="rt-ub-dates">{cert.date}</span>}
                </div>
                {cert.issuer && <div className="rt-ub-org">{cert.issuer}</div>}
              </div>
            ))}
          </div>
        )}

        {data.languages.length > 0 && (
          <div className="rt-ub-section">
            <div className="rt-ub-stitle">Languages</div>
            <div className="rt-ub-langs">
              {data.languages.map((l) => `${l.language} (${l.proficiency})`).join('   ·   ')}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
