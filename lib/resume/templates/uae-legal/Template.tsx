/**
 * UAE Legal — Conservative charcoal, double-rule, formal serif section labels.
 * Category: classic | Ideal for: lawyers, paralegals, compliance, judiciary
 */
import type { TemplateProps } from '../types'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');`

const CSS = `
.rt-ulg {
  font-family:'Inter','Helvetica Neue',Arial,sans-serif;
  font-size:9.5pt;
  line-height:1.6;
  color:#1c1917;
  background:#ffffff;
  width:210mm;
  min-height:297mm;
  padding:14mm 16mm;
  box-sizing:border-box;
}
.rt-ulg-name { font-family:'Lora',Georgia,serif; font-size:25pt; font-weight:700; color:#0c0a09; letter-spacing:0.2px; line-height:1.1; margin-bottom:6px; }
.rt-ulg-contact { display:flex; flex-wrap:wrap; gap:0; font-size:8.5pt; color:#57534e; margin-bottom:0; }
.rt-ulg-ci+.rt-ulg-ci::before { content:" | "; color:#a8a29e; }
.rt-ulg-rule { border:none; border-top:1px solid #1c1917; margin:8px 0 0; }
.rt-ulg-rule2 { border:none; border-top:3px solid #1c1917; margin:2px 0 0; }
.rt-ulg-section { margin-top:13px; }
.rt-ulg-stitle { font-family:'Lora',Georgia,serif; font-size:10pt; font-weight:600; color:#1c1917; border-bottom:1px solid #78716c; padding-bottom:2px; margin-bottom:8px; letter-spacing:0.3px; }
.rt-ulg-entry { margin-bottom:10px; }
.rt-ulg-entry:last-child { margin-bottom:0; }
.rt-ulg-eh { display:flex; justify-content:space-between; align-items:baseline; gap:8px; }
.rt-ulg-role { font-weight:600; font-size:10pt; color:#0c0a09; }
.rt-ulg-dates { font-size:8pt; color:#78716c; white-space:nowrap; flex-shrink:0; font-style:italic; }
.rt-ulg-org { font-size:9pt; color:#57534e; margin-top:1px; }
.rt-ulg-bullets { margin:4px 0 0 15px; padding:0; list-style:disc; color:#292524; }
.rt-ulg-bullets li { font-size:9pt; line-height:1.6; margin-bottom:2px; }
.rt-ulg-summary { font-size:9.5pt; line-height:1.7; color:#292524; }
.rt-ulg-skill-row { font-size:9pt; margin-bottom:3px; }
.rt-ulg-skill-cat { font-weight:600; color:#0c0a09; }
.rt-ulg-langs { font-size:9pt; color:#57534e; }
`

export function UAELegalTemplate({ data }: TemplateProps) {
  const c = data.customization || {}
  const accent = c.primaryColor || '#1c1917'
  const font = c.fontFamily || "'Inter','Helvetica Neue',Arial,sans-serif"
  const textColor = c.textColor || '#1c1917'
  const fontSize = c.fontSize ? `${c.fontSize}pt` : '9.5pt'

  const overrides = `
    .rt-ulg { color:${textColor}; font-family:${font}; font-size:${fontSize}; }
    .rt-ulg-rule,.rt-ulg-rule2 { border-top-color:${accent}; }
    .rt-ulg-stitle { border-bottom-color:${accent}50; }
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
      <div className="rt-ulg">
        <div className="rt-ulg-name">{data.personalInfo.fullName || 'Your Name'}</div>
        <div className="rt-ulg-contact">
          {contacts.map((item, i) => <span key={i} className="rt-ulg-ci">{item}</span>)}
        </div>
        <hr className="rt-ulg-rule2" />
        <hr className="rt-ulg-rule" />

        {data.summary && (
          <div className="rt-ulg-section">
            <div className="rt-ulg-stitle">Professional Summary</div>
            <p className="rt-ulg-summary">{data.summary}</p>
          </div>
        )}

        {data.workExperience.length > 0 && (
          <div className="rt-ulg-section">
            <div className="rt-ulg-stitle">Professional Experience</div>
            {data.workExperience.map((exp, i) => (
              <div key={i} className="rt-ulg-entry">
                <div className="rt-ulg-eh">
                  <span className="rt-ulg-role">{exp.position || 'Position'}</span>
                  <span className="rt-ulg-dates">{dr(exp.startDate, exp.endDate, exp.current)}</span>
                </div>
                <div className="rt-ulg-org">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                {exp.description.filter(Boolean).length > 0 && (
                  <ul className="rt-ulg-bullets">
                    {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="rt-ulg-section">
            <div className="rt-ulg-stitle">Education</div>
            {data.education.map((ed, i) => (
              <div key={i} className="rt-ulg-entry">
                <div className="rt-ulg-eh">
                  <span className="rt-ulg-role">{ed.degree}{ed.field ? `, ${ed.field}` : ''}</span>
                  <span className="rt-ulg-dates">{ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}</span>
                </div>
                <div className="rt-ulg-org">{ed.institution}{ed.gpa ? ` · GPA ${ed.gpa}` : ''}</div>
              </div>
            ))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="rt-ulg-section">
            <div className="rt-ulg-stitle">Areas of Practice</div>
            {data.skills.map((g, i) => (
              <div key={i} className="rt-ulg-skill-row">
                <span className="rt-ulg-skill-cat">{g.category}: </span>
                <span>{g.items.join(' · ')}</span>
              </div>
            ))}
          </div>
        )}

        {data.certifications.length > 0 && (
          <div className="rt-ulg-section">
            <div className="rt-ulg-stitle">Bar Admissions & Certifications</div>
            {data.certifications.map((cert, i) => (
              <div key={i} className="rt-ulg-entry">
                <div className="rt-ulg-eh">
                  <span className="rt-ulg-role">{cert.name}</span>
                  {cert.date && <span className="rt-ulg-dates">{cert.date}</span>}
                </div>
                {cert.issuer && <div className="rt-ulg-org">{cert.issuer}</div>}
              </div>
            ))}
          </div>
        )}

        {data.languages.length > 0 && (
          <div className="rt-ulg-section">
            <div className="rt-ulg-stitle">Languages</div>
            <div className="rt-ulg-langs">
              {data.languages.map((l) => `${l.language} (${l.proficiency})`).join('   ·   ')}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
