/**
 * UAE Marketing — Purple gradient header, Poppins, bold metrics-first layout.
 * Category: modern | Ideal for: marketing, digital, PR, brand management
 */
import type { TemplateProps } from '../types'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`

const CSS = `
.rt-umk {
  font-family:'Poppins','Helvetica Neue',Arial,sans-serif;
  font-size:9.5pt;
  line-height:1.55;
  color:#1f2937;
  background:#ffffff;
  width:210mm;
  min-height:297mm;
  padding:0;
  box-sizing:border-box;
}
.rt-umk-header {
  background:linear-gradient(135deg,#7c3aed 0%,#a855f7 60%,#ec4899 100%);
  padding:13mm 14mm 10mm;
  clip-path:polygon(0 0,100% 0,100% 80%,0 100%);
  margin-bottom:-12mm;
}
.rt-umk-name { font-size:25pt; font-weight:800; color:#fff; letter-spacing:-0.3px; line-height:1.1; margin-bottom:4px; }
.rt-umk-contact { display:flex; flex-wrap:wrap; gap:0; font-size:8.5pt; color:#f3e8ff; }
.rt-umk-ci+.rt-umk-ci::before { content:" · "; }
.rt-umk-body { padding:22mm 14mm 10mm; }
.rt-umk-section { margin-top:12px; }
.rt-umk-stitle { font-size:8pt; font-weight:700; color:#7c3aed; text-transform:uppercase; letter-spacing:1.5px; border-bottom:2px solid #ede9fe; padding-bottom:3px; margin-bottom:8px; }
.rt-umk-entry { margin-bottom:10px; }
.rt-umk-entry:last-child { margin-bottom:0; }
.rt-umk-eh { display:flex; justify-content:space-between; align-items:baseline; gap:8px; }
.rt-umk-role { font-weight:600; font-size:10pt; color:#0f172a; }
.rt-umk-dates { font-size:8pt; color:#6b7280; white-space:nowrap; flex-shrink:0; }
.rt-umk-org { font-size:8.5pt; color:#4b5563; margin-top:1px; }
.rt-umk-bullets { margin:4px 0 0 14px; padding:0; list-style:disc; color:#374151; }
.rt-umk-bullets li { font-size:9pt; line-height:1.55; margin-bottom:2px; }
.rt-umk-summary { font-size:9.5pt; line-height:1.65; color:#374151; }
.rt-umk-skill-group { margin-bottom:5px; }
.rt-umk-skill-label { font-size:7.5pt; color:#7c3aed; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:3px; }
.rt-umk-pills { display:flex; flex-wrap:wrap; gap:3px; }
.rt-umk-pill { background:#f5f3ff; border:1px solid #c4b5fd; border-radius:10px; padding:2px 8px; font-size:8pt; color:#5b21b6; }
.rt-umk-langs { font-size:9pt; color:#4b5563; }
`

export function UAEMarketingTemplate({ data }: TemplateProps) {
  const c = data.customization || {}
  const accent = c.primaryColor || '#7c3aed'
  const font = c.fontFamily || "'Poppins','Helvetica Neue',Arial,sans-serif"
  const textColor = c.textColor || '#1f2937'
  const fontSize = c.fontSize ? `${c.fontSize}pt` : '9.5pt'

  const overrides = `
    .rt-umk { color:${textColor}; font-family:${font}; font-size:${fontSize}; }
    .rt-umk-stitle,.rt-umk-skill-label { color:${accent}; }
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
      <div className="rt-umk">
        <div className="rt-umk-header">
          <div className="rt-umk-name">{data.personalInfo.fullName || 'Your Name'}</div>
          <div className="rt-umk-contact">
            {contacts.map((item, i) => <span key={i} className="rt-umk-ci">{item}</span>)}
          </div>
        </div>
        <div className="rt-umk-body">
          {data.summary && (
            <div className="rt-umk-section">
              <div className="rt-umk-stitle">Profile</div>
              <p className="rt-umk-summary">{data.summary}</p>
            </div>
          )}

          {data.workExperience.length > 0 && (
            <div className="rt-umk-section">
              <div className="rt-umk-stitle">Experience</div>
              {data.workExperience.map((exp, i) => (
                <div key={i} className="rt-umk-entry">
                  <div className="rt-umk-eh">
                    <span className="rt-umk-role">{exp.position || 'Position'}</span>
                    <span className="rt-umk-dates">{dr(exp.startDate, exp.endDate, exp.current)}</span>
                  </div>
                  <div className="rt-umk-org">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                  {exp.description.filter(Boolean).length > 0 && (
                    <ul className="rt-umk-bullets">
                      {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {data.skills.length > 0 && (
            <div className="rt-umk-section">
              <div className="rt-umk-stitle">Skills</div>
              {data.skills.map((g, i) => (
                <div key={i} className="rt-umk-skill-group">
                  {g.category && <div className="rt-umk-skill-label">{g.category}</div>}
                  <div className="rt-umk-pills">
                    {g.items.map((item, j) => <span key={j} className="rt-umk-pill">{item}</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.education.length > 0 && (
            <div className="rt-umk-section">
              <div className="rt-umk-stitle">Education</div>
              {data.education.map((ed, i) => (
                <div key={i} className="rt-umk-entry">
                  <div className="rt-umk-eh">
                    <span className="rt-umk-role">{ed.degree}{ed.field ? `, ${ed.field}` : ''}</span>
                    <span className="rt-umk-dates">{ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}</span>
                  </div>
                  <div className="rt-umk-org">{ed.institution}</div>
                </div>
              ))}
            </div>
          )}

          {data.certifications.length > 0 && (
            <div className="rt-umk-section">
              <div className="rt-umk-stitle">Certifications</div>
              {data.certifications.map((cert, i) => (
                <div key={i} className="rt-umk-entry">
                  <div className="rt-umk-eh">
                    <span className="rt-umk-role">{cert.name}</span>
                    {cert.date && <span className="rt-umk-dates">{cert.date}</span>}
                  </div>
                  {cert.issuer && <div className="rt-umk-org">{cert.issuer}</div>}
                </div>
              ))}
            </div>
          )}

          {data.languages.length > 0 && (
            <div className="rt-umk-section">
              <div className="rt-umk-stitle">Languages</div>
              <div className="rt-umk-langs">
                {data.languages.map((l) => `${l.language} (${l.proficiency})`).join('   ·   ')}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
