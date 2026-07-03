/**
 * UAE Hospitality — Warm amber/gold gradient header, elegant serif headings.
 * Category: creative | Ideal for: hospitality, tourism, F&B, luxury retail
 */
import type { TemplateProps } from '../types'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');`

const CSS = `
.rt-uh {
  font-family:'Inter','Helvetica Neue',Arial,sans-serif;
  font-size:9.5pt;
  line-height:1.55;
  color:#292524;
  background:#ffffff;
  width:210mm;
  min-height:297mm;
  padding:0;
  box-sizing:border-box;
}
.rt-uh-header {
  background:linear-gradient(135deg,#92400e 0%,#b45309 50%,#d97706 100%);
  padding:16mm 14mm 12mm;
  color:#fff;
  position:relative;
}
.rt-uh-name { font-family:'Playfair Display',Georgia,serif; font-size:28pt; font-weight:700; color:#fff; letter-spacing:-0.2px; line-height:1.1; margin-bottom:5px; }
.rt-uh-tagline { font-size:10pt; color:#fde68a; font-weight:500; margin-bottom:8px; letter-spacing:0.3px; }
.rt-uh-contact { display:flex; flex-wrap:wrap; gap:0; font-size:8.5pt; color:#fef3c7; }
.rt-uh-ci+.rt-uh-ci::before { content:" · "; color:#fde68a80; }
.rt-uh-body { padding:10mm 14mm; }
.rt-uh-section { margin-top:12px; }
.rt-uh-stitle { font-family:'Playfair Display',Georgia,serif; font-size:11pt; font-weight:600; color:#92400e; padding-bottom:4px; border-bottom:1.5px solid #fde68a; margin-bottom:8px; }
.rt-uh-entry { margin-bottom:10px; }
.rt-uh-entry:last-child { margin-bottom:0; }
.rt-uh-eh { display:flex; justify-content:space-between; align-items:baseline; gap:8px; }
.rt-uh-role { font-weight:600; font-size:10pt; color:#1c1917; }
.rt-uh-dates { font-size:8pt; color:#78716c; white-space:nowrap; flex-shrink:0; font-style:italic; }
.rt-uh-org { font-size:9pt; color:#57534e; margin-top:1px; }
.rt-uh-bullets { margin:4px 0 0 15px; padding:0; list-style:disc; color:#44403c; }
.rt-uh-bullets li { font-size:9pt; line-height:1.55; margin-bottom:2px; }
.rt-uh-summary { font-size:9.5pt; line-height:1.65; color:#44403c; }
.rt-uh-skill-row { font-size:9pt; margin-bottom:3px; }
.rt-uh-skill-cat { font-weight:600; color:#1c1917; }
.rt-uh-langs { font-size:9pt; color:#57534e; }
`

export function UAEHospitalityTemplate({ data }: TemplateProps) {
  const c = data.customization || {}
  const accent = c.primaryColor || '#92400e'
  const font = c.fontFamily || "'Inter','Helvetica Neue',Arial,sans-serif"
  const textColor = c.textColor || '#292524'
  const fontSize = c.fontSize ? `${c.fontSize}pt` : '9.5pt'

  const overrides = `
    .rt-uh { color:${textColor}; font-family:${font}; font-size:${fontSize}; }
    .rt-uh-stitle { color:${accent}; border-bottom-color:${accent}40; }
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
      <div className="rt-uh">
        <div className="rt-uh-header">
          <div className="rt-uh-name">{data.personalInfo.fullName || 'Your Name'}</div>
          <div className="rt-uh-contact">
            {contacts.map((item, i) => <span key={i} className="rt-uh-ci">{item}</span>)}
          </div>
        </div>
        <div className="rt-uh-body">
          {data.summary && (
            <div className="rt-uh-section">
              <div className="rt-uh-stitle">Professional Profile</div>
              <p className="rt-uh-summary">{data.summary}</p>
            </div>
          )}

          {data.workExperience.length > 0 && (
            <div className="rt-uh-section">
              <div className="rt-uh-stitle">Experience</div>
              {data.workExperience.map((exp, i) => (
                <div key={i} className="rt-uh-entry">
                  <div className="rt-uh-eh">
                    <span className="rt-uh-role">{exp.position || 'Position'}</span>
                    <span className="rt-uh-dates">{dr(exp.startDate, exp.endDate, exp.current)}</span>
                  </div>
                  <div className="rt-uh-org">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                  {exp.description.filter(Boolean).length > 0 && (
                    <ul className="rt-uh-bullets">
                      {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {data.education.length > 0 && (
            <div className="rt-uh-section">
              <div className="rt-uh-stitle">Education</div>
              {data.education.map((ed, i) => (
                <div key={i} className="rt-uh-entry">
                  <div className="rt-uh-eh">
                    <span className="rt-uh-role">{ed.degree}{ed.field ? `, ${ed.field}` : ''}</span>
                    <span className="rt-uh-dates">{ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}</span>
                  </div>
                  <div className="rt-uh-org">{ed.institution}{ed.gpa ? ` · GPA ${ed.gpa}` : ''}</div>
                </div>
              ))}
            </div>
          )}

          {data.skills.length > 0 && (
            <div className="rt-uh-section">
              <div className="rt-uh-stitle">Skills</div>
              {data.skills.map((g, i) => (
                <div key={i} className="rt-uh-skill-row">
                  <span className="rt-uh-skill-cat">{g.category}: </span>
                  <span>{g.items.join(', ')}</span>
                </div>
              ))}
            </div>
          )}

          {data.certifications.length > 0 && (
            <div className="rt-uh-section">
              <div className="rt-uh-stitle">Certifications</div>
              {data.certifications.map((cert, i) => (
                <div key={i} className="rt-uh-entry">
                  <div className="rt-uh-eh">
                    <span className="rt-uh-role">{cert.name}</span>
                    {cert.date && <span className="rt-uh-dates">{cert.date}</span>}
                  </div>
                  {cert.issuer && <div className="rt-uh-org">{cert.issuer}</div>}
                </div>
              ))}
            </div>
          )}

          {data.languages.length > 0 && (
            <div className="rt-uh-section">
              <div className="rt-uh-stitle">Languages</div>
              <div className="rt-uh-langs">
                {data.languages.map((l) => `${l.language} (${l.proficiency})`).join('   ·   ')}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
