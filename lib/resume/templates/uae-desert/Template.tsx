/**
 * UAE Desert Dunes — Warm sand/terracotta, Playfair headers, elegant.
 * Category: premium | Ideal for: real estate, luxury, senior professionals
 */
import type { TemplateProps } from '../types'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');`

const CSS = `
.rt-uds {
  font-family:'Inter','Helvetica Neue',Arial,sans-serif;
  font-size:9.5pt;
  line-height:1.6;
  color:#292524;
  background:#fffbf7;
  width:210mm;
  min-height:297mm;
  padding:0;
  box-sizing:border-box;
}
.rt-uds-header { background:linear-gradient(135deg,#92400e 0%,#c2410c 100%); padding:13mm 14mm 11mm; }
.rt-uds-name { font-family:'Playfair Display',Georgia,serif; font-size:27pt; font-weight:700; color:#fef3c7; letter-spacing:0.2px; line-height:1.1; margin-bottom:4px; }
.rt-uds-deco { display:flex; align-items:center; gap:8px; margin:6px 0; }
.rt-uds-deco-line { flex:1; height:1px; background:rgba(253,230,138,0.5); }
.rt-uds-deco-diamond { width:6px; height:6px; background:#fbbf24; transform:rotate(45deg); flex-shrink:0; }
.rt-uds-contact { display:flex; flex-wrap:wrap; gap:0; font-size:8.5pt; color:#fde68a; }
.rt-uds-ci+.rt-uds-ci::before { content:" · "; color:#f59e0b80; }
.rt-uds-body { padding:11mm 14mm; }
.rt-uds-section { margin-top:12px; }
.rt-uds-stitle { font-family:'Playfair Display',Georgia,serif; font-size:11.5pt; font-weight:600; color:#92400e; display:flex; align-items:center; gap:8px; margin-bottom:7px; }
.rt-uds-stitle::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,#fbbf2460,transparent); }
.rt-uds-entry { margin-bottom:10px; }
.rt-uds-entry:last-child { margin-bottom:0; }
.rt-uds-eh { display:flex; justify-content:space-between; align-items:baseline; gap:8px; }
.rt-uds-role { font-weight:600; font-size:10pt; color:#1c1917; }
.rt-uds-dates { font-size:8pt; color:#78716c; white-space:nowrap; flex-shrink:0; font-style:italic; }
.rt-uds-org { font-size:9pt; color:#57534e; margin-top:1px; }
.rt-uds-bullets { margin:4px 0 0 15px; padding:0; list-style:disc; color:#44403c; }
.rt-uds-bullets li { font-size:9pt; line-height:1.6; margin-bottom:2px; }
.rt-uds-summary { font-size:9.5pt; line-height:1.7; color:#44403c; }
.rt-uds-skill-row { font-size:9pt; margin-bottom:3px; }
.rt-uds-skill-cat { font-weight:600; color:#1c1917; }
.rt-uds-langs { font-size:9pt; color:#57534e; }
`

export function UAEDesertTemplate({ data }: TemplateProps) {
  const c = data.customization || {}
  const accent = c.primaryColor || '#92400e'
  const font = c.fontFamily || "'Inter','Helvetica Neue',Arial,sans-serif"
  const textColor = c.textColor || '#292524'
  const fontSize = c.fontSize ? `${c.fontSize}pt` : '9.5pt'

  const overrides = `
    .rt-uds { color:${textColor}; font-family:${font}; font-size:${fontSize}; }
    .rt-uds-stitle { color:${accent}; }
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
      <div className="rt-uds">
        <div className="rt-uds-header">
          <div className="rt-uds-name">{data.personalInfo.fullName || 'Your Name'}</div>
          <div className="rt-uds-deco">
            <div className="rt-uds-deco-line" />
            <div className="rt-uds-deco-diamond" />
            <div className="rt-uds-deco-line" />
          </div>
          <div className="rt-uds-contact">
            {contacts.map((item, i) => <span key={i} className="rt-uds-ci">{item}</span>)}
          </div>
        </div>
        <div className="rt-uds-body">
          {data.summary && (
            <div className="rt-uds-section">
              <div className="rt-uds-stitle">Profile</div>
              <p className="rt-uds-summary">{data.summary}</p>
            </div>
          )}

          {data.workExperience.length > 0 && (
            <div className="rt-uds-section">
              <div className="rt-uds-stitle">Experience</div>
              {data.workExperience.map((exp, i) => (
                <div key={i} className="rt-uds-entry">
                  <div className="rt-uds-eh">
                    <span className="rt-uds-role">{exp.position || 'Position'}</span>
                    <span className="rt-uds-dates">{dr(exp.startDate, exp.endDate, exp.current)}</span>
                  </div>
                  <div className="rt-uds-org">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                  {exp.description.filter(Boolean).length > 0 && (
                    <ul className="rt-uds-bullets">
                      {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {data.education.length > 0 && (
            <div className="rt-uds-section">
              <div className="rt-uds-stitle">Education</div>
              {data.education.map((ed, i) => (
                <div key={i} className="rt-uds-entry">
                  <div className="rt-uds-eh">
                    <span className="rt-uds-role">{ed.degree}{ed.field ? `, ${ed.field}` : ''}</span>
                    <span className="rt-uds-dates">{ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}</span>
                  </div>
                  <div className="rt-uds-org">{ed.institution}{ed.gpa ? ` · GPA ${ed.gpa}` : ''}</div>
                </div>
              ))}
            </div>
          )}

          {data.skills.length > 0 && (
            <div className="rt-uds-section">
              <div className="rt-uds-stitle">Skills</div>
              {data.skills.map((g, i) => (
                <div key={i} className="rt-uds-skill-row">
                  <span className="rt-uds-skill-cat">{g.category}: </span>
                  <span>{g.items.join(', ')}</span>
                </div>
              ))}
            </div>
          )}

          {data.certifications.length > 0 && (
            <div className="rt-uds-section">
              <div className="rt-uds-stitle">Certifications</div>
              {data.certifications.map((cert, i) => (
                <div key={i} className="rt-uds-entry">
                  <div className="rt-uds-eh">
                    <span className="rt-uds-role">{cert.name}</span>
                    {cert.date && <span className="rt-uds-dates">{cert.date}</span>}
                  </div>
                  {cert.issuer && <div className="rt-uds-org">{cert.issuer}</div>}
                </div>
              ))}
            </div>
          )}

          {data.languages.length > 0 && (
            <div className="rt-uds-section">
              <div className="rt-uds-stitle">Languages</div>
              <div className="rt-uds-langs">
                {data.languages.map((l) => `${l.language} (${l.proficiency})`).join('   ·   ')}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
