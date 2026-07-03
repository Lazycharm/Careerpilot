/**
 * UAE Tech — Dark left sidebar, blue accent, code-inspired section labels.
 * Category: modern | Ideal for: software, IT, engineering, startups
 */
import type { TemplateProps } from '../types'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');`

const CSS = `
.rt-ut {
  font-family:'Inter','Helvetica Neue',Arial,sans-serif;
  font-size:9.5pt;
  line-height:1.55;
  color:#1f2937;
  background:#ffffff;
  width:210mm;
  min-height:297mm;
  padding:0;
  box-sizing:border-box;
  display:flex;
}
.rt-ut-sidebar {
  width:62mm;
  background:#0f172a;
  padding:12mm 8mm;
  flex-shrink:0;
  color:#e2e8f0;
}
.rt-ut-main {
  flex:1;
  padding:12mm 10mm;
  min-width:0;
}
.rt-ut-photo { width:56px; height:56px; border-radius:50%; border:2.5px solid #3b82f6; object-fit:cover; margin-bottom:10px; }
.rt-ut-name { font-size:16pt; font-weight:700; color:#f8fafc; line-height:1.2; margin-bottom:3px; }
.rt-ut-tagline { font-size:8pt; color:#94a3b8; font-family:'JetBrains Mono',monospace; margin-bottom:12px; }
.rt-ut-stitle-s { font-size:6.5pt; font-weight:600; color:#3b82f6; text-transform:uppercase; letter-spacing:2px; border-bottom:1px solid #1e3a5f; padding-bottom:3px; margin:12px 0 7px; font-family:'JetBrains Mono',monospace; }
.rt-ut-contact-item { font-size:8pt; color:#94a3b8; margin-bottom:3px; word-break:break-all; }
.rt-ut-skill-group-s { margin-bottom:8px; }
.rt-ut-skill-label-s { font-size:7.5pt; color:#cbd5e1; font-weight:500; margin-bottom:3px; }
.rt-ut-pill-s { display:inline-block; background:#1e3a5f; border:1px solid #2563eb30; border-radius:2px; padding:1px 5px; font-size:7.5pt; color:#93c5fd; margin:1.5px; }
.rt-ut-cert-s { font-size:8pt; color:#cbd5e1; margin-bottom:3px; }
.rt-ut-lang-s { font-size:8pt; color:#94a3b8; }

.rt-ut-stitle { font-size:7.5pt; font-weight:600; color:#2563eb; text-transform:uppercase; letter-spacing:2px; border-bottom:1px solid #dbeafe; padding-bottom:3px; margin-bottom:8px; font-family:'JetBrains Mono',monospace; }
.rt-ut-entry { margin-bottom:10px; }
.rt-ut-entry:last-child { margin-bottom:0; }
.rt-ut-eh { display:flex; justify-content:space-between; align-items:baseline; gap:8px; }
.rt-ut-role { font-weight:600; font-size:9.5pt; color:#0f172a; }
.rt-ut-dates { font-size:7.5pt; color:#6b7280; white-space:nowrap; flex-shrink:0; font-family:'JetBrains Mono',monospace; }
.rt-ut-org { font-size:8.5pt; color:#4b5563; margin-top:1px; }
.rt-ut-bullets { margin:4px 0 0 14px; padding:0; list-style:disc; color:#374151; }
.rt-ut-bullets li { font-size:9pt; line-height:1.55; margin-bottom:2px; }
.rt-ut-summary { font-size:9.5pt; line-height:1.65; color:#374151; }
.rt-ut-section { margin-top:12px; }
`

export function UAETechTemplate({ data }: TemplateProps) {
  const c = data.customization || {}
  const accent = c.primaryColor || '#2563eb'
  const font = c.fontFamily || "'Inter','Helvetica Neue',Arial,sans-serif"
  const textColor = c.textColor || '#1f2937'
  const fontSize = c.fontSize ? `${c.fontSize}pt` : '9.5pt'

  const overrides = `
    .rt-ut { color:${textColor}; font-family:${font}; font-size:${fontSize}; }
    .rt-ut-stitle,.rt-ut-stitle-s,.rt-ut-tagline { color:${accent}; }
    .rt-ut-photo,.rt-ut-pill-s { border-color:${accent}; }
    .rt-ut-pill-s { color:${accent}; }
  `

  const dr = (s: string, e: string | null, cur: boolean) =>
    `${s}${s && (cur || e) ? ' → ' : ''}${cur ? 'Present' : e || ''}`

  const photo = data.personalInfo.photo

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONTS + CSS + overrides }} />
      <div className="rt-ut">
        {/* Sidebar */}
        <div className="rt-ut-sidebar">
          {photo && <img src={photo} alt="Photo" className="rt-ut-photo" />}
          <div className="rt-ut-name">{data.personalInfo.fullName || 'Your Name'}</div>
          {data.workExperience[0]?.position && (
            <div className="rt-ut-tagline">{'// ' + data.workExperience[0].position}</div>
          )}

          <div className="rt-ut-stitle-s">Contact</div>
          {data.personalInfo.email && <div className="rt-ut-contact-item">{data.personalInfo.email}</div>}
          {data.personalInfo.phone && <div className="rt-ut-contact-item">{data.personalInfo.phone}</div>}
          {data.personalInfo.location && <div className="rt-ut-contact-item">{data.personalInfo.location}</div>}
          {data.personalInfo.linkedIn && <div className="rt-ut-contact-item">{data.personalInfo.linkedIn.replace(/^https?:\/\//, '')}</div>}
          {data.personalInfo.website && <div className="rt-ut-contact-item">{data.personalInfo.website.replace(/^https?:\/\//, '')}</div>}

          {data.skills.length > 0 && (
            <>
              <div className="rt-ut-stitle-s">Skills</div>
              {data.skills.map((g, i) => (
                <div key={i} className="rt-ut-skill-group-s">
                  {g.category && <div className="rt-ut-skill-label-s">{g.category}</div>}
                  <div>
                    {g.items.map((item, j) => <span key={j} className="rt-ut-pill-s">{item}</span>)}
                  </div>
                </div>
              ))}
            </>
          )}

          {data.certifications.length > 0 && (
            <>
              <div className="rt-ut-stitle-s">Certifications</div>
              {data.certifications.map((cert, i) => (
                <div key={i} className="rt-ut-cert-s">{cert.name}{cert.issuer ? ` · ${cert.issuer}` : ''}</div>
              ))}
            </>
          )}

          {data.languages.length > 0 && (
            <>
              <div className="rt-ut-stitle-s">Languages</div>
              {data.languages.map((l, i) => (
                <div key={i} className="rt-ut-lang-s">{l.language} ({l.proficiency})</div>
              ))}
            </>
          )}
        </div>

        {/* Main */}
        <div className="rt-ut-main">
          {data.summary && (
            <div className="rt-ut-section">
              <div className="rt-ut-stitle">About</div>
              <p className="rt-ut-summary">{data.summary}</p>
            </div>
          )}

          {data.workExperience.length > 0 && (
            <div className="rt-ut-section">
              <div className="rt-ut-stitle">Experience</div>
              {data.workExperience.map((exp, i) => (
                <div key={i} className="rt-ut-entry">
                  <div className="rt-ut-eh">
                    <span className="rt-ut-role">{exp.position || 'Position'}</span>
                    <span className="rt-ut-dates">{dr(exp.startDate, exp.endDate, exp.current)}</span>
                  </div>
                  <div className="rt-ut-org">{exp.company}{exp.location ? ` @ ${exp.location}` : ''}</div>
                  {exp.description.filter(Boolean).length > 0 && (
                    <ul className="rt-ut-bullets">
                      {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {data.education.length > 0 && (
            <div className="rt-ut-section">
              <div className="rt-ut-stitle">Education</div>
              {data.education.map((ed, i) => (
                <div key={i} className="rt-ut-entry">
                  <div className="rt-ut-eh">
                    <span className="rt-ut-role">{ed.degree}{ed.field ? `, ${ed.field}` : ''}</span>
                    <span className="rt-ut-dates">{ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}</span>
                  </div>
                  <div className="rt-ut-org">{ed.institution}{ed.gpa ? ` · GPA ${ed.gpa}` : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
