/**
 * UAE Retail — Fresh emerald green, Nunito font, customer-focused layout.
 * Category: modern | Ideal for: retail, sales, customer service, FMCG
 */
import type { TemplateProps } from '../types'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');`

const CSS = `
.rt-url {
  font-family:'Nunito','Helvetica Neue',Arial,sans-serif;
  font-size:9.5pt;
  line-height:1.6;
  color:#1f2937;
  background:#ffffff;
  width:210mm;
  min-height:297mm;
  padding:0;
  box-sizing:border-box;
}
.rt-url-header { background:#059669; padding:12mm 14mm 10mm; }
.rt-url-name { font-size:25pt; font-weight:800; color:#fff; line-height:1.1; margin-bottom:5px; }
.rt-url-contact { display:flex; flex-wrap:wrap; gap:0; font-size:8.5pt; color:#a7f3d0; }
.rt-url-ci+.rt-url-ci::before { content:" · "; }
.rt-url-body { padding:10mm 14mm; }
.rt-url-section { margin-top:11px; }
.rt-url-stitle { font-size:8pt; font-weight:800; color:#059669; text-transform:uppercase; letter-spacing:1.5px; border-bottom:2px solid #d1fae5; padding-bottom:3px; margin-bottom:8px; }
.rt-url-entry { margin-bottom:9px; }
.rt-url-entry:last-child { margin-bottom:0; }
.rt-url-eh { display:flex; justify-content:space-between; align-items:baseline; gap:8px; }
.rt-url-role { font-weight:700; font-size:10pt; color:#0f172a; }
.rt-url-dates { font-size:8pt; color:#64748b; white-space:nowrap; flex-shrink:0; }
.rt-url-org { font-size:9pt; color:#374151; margin-top:1px; font-weight:600; }
.rt-url-bullets { margin:4px 0 0 14px; padding:0; list-style:disc; color:#374151; }
.rt-url-bullets li { font-size:9pt; line-height:1.55; margin-bottom:2px; }
.rt-url-summary { font-size:9.5pt; line-height:1.65; color:#374151; }
.rt-url-pills { display:flex; flex-wrap:wrap; gap:3px; }
.rt-url-pill { background:#ecfdf5; border:1px solid #6ee7b7; border-radius:10px; padding:2px 9px; font-size:8pt; color:#065f46; font-weight:600; }
.rt-url-langs { font-size:9pt; color:#4b5563; }
`

export function UAERetailTemplate({ data }: TemplateProps) {
  const c = data.customization || {}
  const accent = c.primaryColor || '#059669'
  const font = c.fontFamily || "'Nunito','Helvetica Neue',Arial,sans-serif"
  const textColor = c.textColor || '#1f2937'
  const fontSize = c.fontSize ? `${c.fontSize}pt` : '9.5pt'

  const overrides = `
    .rt-url { color:${textColor}; font-family:${font}; font-size:${fontSize}; }
    .rt-url-header { background:${accent}; }
    .rt-url-stitle { color:${accent}; }
    .rt-url-pill { border-color:${accent}50; color:${accent}; background:${accent}10; }
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
      <div className="rt-url">
        <div className="rt-url-header">
          <div className="rt-url-name">{data.personalInfo.fullName || 'Your Name'}</div>
          <div className="rt-url-contact">
            {contacts.map((item, i) => <span key={i} className="rt-url-ci">{item}</span>)}
          </div>
        </div>
        <div className="rt-url-body">
          {data.summary && (
            <div className="rt-url-section">
              <div className="rt-url-stitle">Profile</div>
              <p className="rt-url-summary">{data.summary}</p>
            </div>
          )}

          {data.workExperience.length > 0 && (
            <div className="rt-url-section">
              <div className="rt-url-stitle">Experience</div>
              {data.workExperience.map((exp, i) => (
                <div key={i} className="rt-url-entry">
                  <div className="rt-url-eh">
                    <span className="rt-url-role">{exp.position || 'Position'}</span>
                    <span className="rt-url-dates">{dr(exp.startDate, exp.endDate, exp.current)}</span>
                  </div>
                  <div className="rt-url-org">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                  {exp.description.filter(Boolean).length > 0 && (
                    <ul className="rt-url-bullets">
                      {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {data.skills.length > 0 && (
            <div className="rt-url-section">
              <div className="rt-url-stitle">Skills</div>
              <div className="rt-url-pills">
                {data.skills.flatMap(g => g.items).map((item, i) => (
                  <span key={i} className="rt-url-pill">{item}</span>
                ))}
              </div>
            </div>
          )}

          {data.education.length > 0 && (
            <div className="rt-url-section">
              <div className="rt-url-stitle">Education</div>
              {data.education.map((ed, i) => (
                <div key={i} className="rt-url-entry">
                  <div className="rt-url-eh">
                    <span className="rt-url-role">{ed.degree}{ed.field ? `, ${ed.field}` : ''}</span>
                    <span className="rt-url-dates">{ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}</span>
                  </div>
                  <div className="rt-url-org">{ed.institution}</div>
                </div>
              ))}
            </div>
          )}

          {data.certifications.length > 0 && (
            <div className="rt-url-section">
              <div className="rt-url-stitle">Certifications</div>
              {data.certifications.map((cert, i) => (
                <div key={i} className="rt-url-entry">
                  <div className="rt-url-eh">
                    <span className="rt-url-role">{cert.name}</span>
                    {cert.date && <span className="rt-url-dates">{cert.date}</span>}
                  </div>
                  {cert.issuer && <div className="rt-url-org">{cert.issuer}</div>}
                </div>
              ))}
            </div>
          )}

          {data.languages.length > 0 && (
            <div className="rt-url-section">
              <div className="rt-url-stitle">Languages</div>
              <div className="rt-url-langs">
                {data.languages.map((l) => `${l.language} (${l.proficiency})`).join('   ·   ')}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
