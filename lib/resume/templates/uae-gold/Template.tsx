/**
 * UAE Gold Premium — Dark header with gold rule, luxury feel.
 * Category: premium | Ideal for: luxury retail, hospitality management, VIP roles
 */
import type { TemplateProps } from '../types'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600&display=swap');`

const CSS = `
.rt-ugld {
  font-family:'Inter','Helvetica Neue',Arial,sans-serif;
  font-size:9.5pt;
  line-height:1.55;
  color:#1c1917;
  background:#ffffff;
  width:210mm;
  min-height:297mm;
  padding:0;
  box-sizing:border-box;
}
.rt-ugld-header { background:#0c0a09; padding:14mm 14mm 12mm; }
.rt-ugld-name { font-family:'Cormorant Garamond',Georgia,serif; font-size:30pt; font-weight:700; color:#fbbf24; letter-spacing:0.5px; line-height:1.1; margin-bottom:4px; }
.rt-ugld-rule-g { height:1px; background:linear-gradient(90deg,#b45309,#fbbf24,#b45309); margin:6px 0; }
.rt-ugld-contact { display:flex; flex-wrap:wrap; gap:0; font-size:8.5pt; color:#d6d3d1; }
.rt-ugld-ci+.rt-ugld-ci::before { content:" · "; color:#78716c; }
.rt-ugld-body { padding:11mm 14mm; }
.rt-ugld-section { margin-top:12px; }
.rt-ugld-stitle { font-family:'Cormorant Garamond',Georgia,serif; font-size:12pt; font-weight:600; color:#92400e; border-bottom:1px solid #fde68a; padding-bottom:2px; margin-bottom:8px; letter-spacing:0.5px; }
.rt-ugld-entry { margin-bottom:10px; }
.rt-ugld-entry:last-child { margin-bottom:0; }
.rt-ugld-eh { display:flex; justify-content:space-between; align-items:baseline; gap:8px; }
.rt-ugld-role { font-weight:600; font-size:10pt; color:#1c1917; }
.rt-ugld-dates { font-size:8pt; color:#78716c; white-space:nowrap; flex-shrink:0; font-style:italic; }
.rt-ugld-org { font-size:9pt; color:#57534e; margin-top:1px; }
.rt-ugld-bullets { margin:4px 0 0 15px; padding:0; list-style:disc; color:#292524; }
.rt-ugld-bullets li { font-size:9pt; line-height:1.55; margin-bottom:2px; }
.rt-ugld-summary { font-size:9.5pt; line-height:1.65; color:#292524; font-family:'Cormorant Garamond',Georgia,serif; font-size:11pt; }
.rt-ugld-skill-row { font-size:9pt; margin-bottom:3px; }
.rt-ugld-skill-cat { font-weight:600; color:#1c1917; }
.rt-ugld-langs { font-size:9pt; color:#57534e; }
`

export function UAEGoldTemplate({ data }: TemplateProps) {
  const c = data.customization || {}
  const accent = c.primaryColor || '#92400e'
  const font = c.fontFamily || "'Inter','Helvetica Neue',Arial,sans-serif"
  const textColor = c.textColor || '#1c1917'
  const fontSize = c.fontSize ? `${c.fontSize}pt` : '9.5pt'

  const overrides = `
    .rt-ugld { color:${textColor}; font-family:${font}; font-size:${fontSize}; }
    .rt-ugld-stitle { color:${accent}; }
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
      <div className="rt-ugld">
        <div className="rt-ugld-header">
          <div className="rt-ugld-name">{data.personalInfo.fullName || 'Your Name'}</div>
          <div className="rt-ugld-rule-g" />
          <div className="rt-ugld-contact">
            {contacts.map((item, i) => <span key={i} className="rt-ugld-ci">{item}</span>)}
          </div>
        </div>
        <div className="rt-ugld-body">
          {data.summary && (
            <div className="rt-ugld-section">
              <div className="rt-ugld-stitle">Profile</div>
              <p className="rt-ugld-summary">{data.summary}</p>
            </div>
          )}

          {data.workExperience.length > 0 && (
            <div className="rt-ugld-section">
              <div className="rt-ugld-stitle">Experience</div>
              {data.workExperience.map((exp, i) => (
                <div key={i} className="rt-ugld-entry">
                  <div className="rt-ugld-eh">
                    <span className="rt-ugld-role">{exp.position || 'Position'}</span>
                    <span className="rt-ugld-dates">{dr(exp.startDate, exp.endDate, exp.current)}</span>
                  </div>
                  <div className="rt-ugld-org">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                  {exp.description.filter(Boolean).length > 0 && (
                    <ul className="rt-ugld-bullets">
                      {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {data.education.length > 0 && (
            <div className="rt-ugld-section">
              <div className="rt-ugld-stitle">Education</div>
              {data.education.map((ed, i) => (
                <div key={i} className="rt-ugld-entry">
                  <div className="rt-ugld-eh">
                    <span className="rt-ugld-role">{ed.degree}{ed.field ? `, ${ed.field}` : ''}</span>
                    <span className="rt-ugld-dates">{ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}</span>
                  </div>
                  <div className="rt-ugld-org">{ed.institution}{ed.gpa ? ` · GPA ${ed.gpa}` : ''}</div>
                </div>
              ))}
            </div>
          )}

          {data.skills.length > 0 && (
            <div className="rt-ugld-section">
              <div className="rt-ugld-stitle">Skills</div>
              {data.skills.map((g, i) => (
                <div key={i} className="rt-ugld-skill-row">
                  <span className="rt-ugld-skill-cat">{g.category}: </span>
                  <span>{g.items.join(', ')}</span>
                </div>
              ))}
            </div>
          )}

          {data.certifications.length > 0 && (
            <div className="rt-ugld-section">
              <div className="rt-ugld-stitle">Certifications</div>
              {data.certifications.map((cert, i) => (
                <div key={i} className="rt-ugld-entry">
                  <div className="rt-ugld-eh">
                    <span className="rt-ugld-role">{cert.name}</span>
                    {cert.date && <span className="rt-ugld-dates">{cert.date}</span>}
                  </div>
                  {cert.issuer && <div className="rt-ugld-org">{cert.issuer}</div>}
                </div>
              ))}
            </div>
          )}

          {data.languages.length > 0 && (
            <div className="rt-ugld-section">
              <div className="rt-ugld-stitle">Languages</div>
              <div className="rt-ugld-langs">
                {data.languages.map((l) => `${l.language} (${l.proficiency})`).join('   ·   ')}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
