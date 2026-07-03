/**
 * UAE Healthcare — Clean teal/white, two-tone left border, medical professional.
 * Category: specialty | Ideal for: doctors, nurses, pharmacists, healthcare admins
 */
import type { TemplateProps } from '../types'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap');`

const CSS = `
.rt-uhc {
  font-family:'Nunito','Helvetica Neue',Arial,sans-serif;
  font-size:9.5pt;
  line-height:1.6;
  color:#1e293b;
  background:#ffffff;
  width:210mm;
  min-height:297mm;
  padding:0;
  box-sizing:border-box;
}
.rt-uhc-header { background:#0f766e; padding:12mm 14mm 10mm; }
.rt-uhc-name { font-size:24pt; font-weight:700; color:#fff; line-height:1.1; margin-bottom:4px; }
.rt-uhc-contact { display:flex; flex-wrap:wrap; gap:0; font-size:8.5pt; color:#99f6e4; }
.rt-uhc-ci+.rt-uhc-ci::before { content:" · "; color:#5eead480; }
.rt-uhc-body { padding:10mm 14mm; }
.rt-uhc-section { margin-top:12px; padding-left:10px; border-left:3px solid #0f766e; }
.rt-uhc-stitle { font-size:8pt; font-weight:700; color:#0f766e; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:7px; }
.rt-uhc-entry { margin-bottom:9px; }
.rt-uhc-entry:last-child { margin-bottom:0; }
.rt-uhc-eh { display:flex; justify-content:space-between; align-items:baseline; gap:8px; }
.rt-uhc-role { font-weight:600; font-size:10pt; color:#0f172a; }
.rt-uhc-dates { font-size:8pt; color:#64748b; white-space:nowrap; flex-shrink:0; }
.rt-uhc-org { font-size:9pt; color:#475569; margin-top:1px; }
.rt-uhc-bullets { margin:4px 0 0 14px; padding:0; list-style:disc; color:#374151; }
.rt-uhc-bullets li { font-size:9pt; line-height:1.55; margin-bottom:2px; }
.rt-uhc-summary { font-size:9.5pt; line-height:1.65; color:#334155; }
.rt-uhc-skill-row { font-size:9pt; margin-bottom:3px; }
.rt-uhc-skill-cat { font-weight:600; color:#0f172a; }
.rt-uhc-langs { font-size:9pt; color:#475569; }
`

export function UAEHealthcareTemplate({ data }: TemplateProps) {
  const c = data.customization || {}
  const accent = c.primaryColor || '#0f766e'
  const font = c.fontFamily || "'Nunito','Helvetica Neue',Arial,sans-serif"
  const textColor = c.textColor || '#1e293b'
  const fontSize = c.fontSize ? `${c.fontSize}pt` : '9.5pt'

  const overrides = `
    .rt-uhc { color:${textColor}; font-family:${font}; font-size:${fontSize}; }
    .rt-uhc-header { background:${accent}; }
    .rt-uhc-section { border-left-color:${accent}; }
    .rt-uhc-stitle { color:${accent}; }
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
      <div className="rt-uhc">
        <div className="rt-uhc-header">
          <div className="rt-uhc-name">{data.personalInfo.fullName || 'Your Name'}</div>
          <div className="rt-uhc-contact">
            {contacts.map((item, i) => <span key={i} className="rt-uhc-ci">{item}</span>)}
          </div>
        </div>
        <div className="rt-uhc-body">
          {data.summary && (
            <div className="rt-uhc-section">
              <div className="rt-uhc-stitle">Professional Summary</div>
              <p className="rt-uhc-summary">{data.summary}</p>
            </div>
          )}

          {data.workExperience.length > 0 && (
            <div className="rt-uhc-section">
              <div className="rt-uhc-stitle">Clinical Experience</div>
              {data.workExperience.map((exp, i) => (
                <div key={i} className="rt-uhc-entry">
                  <div className="rt-uhc-eh">
                    <span className="rt-uhc-role">{exp.position || 'Position'}</span>
                    <span className="rt-uhc-dates">{dr(exp.startDate, exp.endDate, exp.current)}</span>
                  </div>
                  <div className="rt-uhc-org">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                  {exp.description.filter(Boolean).length > 0 && (
                    <ul className="rt-uhc-bullets">
                      {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {data.education.length > 0 && (
            <div className="rt-uhc-section">
              <div className="rt-uhc-stitle">Education & Training</div>
              {data.education.map((ed, i) => (
                <div key={i} className="rt-uhc-entry">
                  <div className="rt-uhc-eh">
                    <span className="rt-uhc-role">{ed.degree}{ed.field ? `, ${ed.field}` : ''}</span>
                    <span className="rt-uhc-dates">{ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}</span>
                  </div>
                  <div className="rt-uhc-org">{ed.institution}{ed.gpa ? ` · GPA ${ed.gpa}` : ''}</div>
                </div>
              ))}
            </div>
          )}

          {data.skills.length > 0 && (
            <div className="rt-uhc-section">
              <div className="rt-uhc-stitle">Clinical Skills</div>
              {data.skills.map((g, i) => (
                <div key={i} className="rt-uhc-skill-row">
                  <span className="rt-uhc-skill-cat">{g.category}: </span>
                  <span>{g.items.join(', ')}</span>
                </div>
              ))}
            </div>
          )}

          {data.certifications.length > 0 && (
            <div className="rt-uhc-section">
              <div className="rt-uhc-stitle">Licenses & Certifications</div>
              {data.certifications.map((cert, i) => (
                <div key={i} className="rt-uhc-entry">
                  <div className="rt-uhc-eh">
                    <span className="rt-uhc-role">{cert.name}</span>
                    {cert.date && <span className="rt-uhc-dates">{cert.date}</span>}
                  </div>
                  {cert.issuer && <div className="rt-uhc-org">{cert.issuer}</div>}
                </div>
              ))}
            </div>
          )}

          {data.languages.length > 0 && (
            <div className="rt-uhc-section">
              <div className="rt-uhc-stitle">Languages</div>
              <div className="rt-uhc-langs">
                {data.languages.map((l) => `${l.language} (${l.proficiency})`).join('   ·   ')}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
