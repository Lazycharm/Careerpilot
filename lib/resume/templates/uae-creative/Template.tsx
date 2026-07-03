/**
 * UAE Creative — Violet gradient sidebar, bold name, pill skills.
 * Category: creative | Ideal for: graphic design, art direction, creative agencies
 */
import type { TemplateProps } from '../types'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');`

const CSS = `
.rt-ucr {
  font-family:'Poppins','Helvetica Neue',Arial,sans-serif;
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
.rt-ucr-sidebar {
  width:60mm;
  background:linear-gradient(180deg,#5b21b6 0%,#7c3aed 50%,#a855f7 100%);
  padding:12mm 8mm;
  flex-shrink:0;
  color:#fff;
}
.rt-ucr-main { flex:1; padding:12mm 10mm; min-width:0; }
.rt-ucr-photo { width:60px; height:60px; border-radius:50%; border:3px solid rgba(255,255,255,0.5); object-fit:cover; margin-bottom:10px; }
.rt-ucr-name { font-size:14pt; font-weight:800; color:#fff; line-height:1.2; margin-bottom:3px; }
.rt-ucr-tagline { font-size:8pt; color:#e9d5ff; font-weight:300; margin-bottom:12px; }
.rt-ucr-stitle-s { font-size:6.5pt; font-weight:700; color:#e9d5ff; text-transform:uppercase; letter-spacing:2px; border-bottom:1px solid rgba(255,255,255,0.2); padding-bottom:3px; margin:11px 0 7px; }
.rt-ucr-contact-item { font-size:8pt; color:#ddd6fe; margin-bottom:3px; word-break:break-all; }
.rt-ucr-pill-s { display:inline-block; background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3); border-radius:10px; padding:2px 7px; font-size:7.5pt; color:#f5f3ff; margin:1.5px; }
.rt-ucr-lang-s { font-size:8pt; color:#e9d5ff; margin-bottom:2px; }

.rt-ucr-name-main { font-size:22pt; font-weight:800; color:#0f172a; line-height:1.1; margin-bottom:6px; }
.rt-ucr-stitle { font-size:8pt; font-weight:700; color:#7c3aed; text-transform:uppercase; letter-spacing:1.5px; border-bottom:2px solid #a855f720; padding-bottom:3px; margin-bottom:8px; }
.rt-ucr-section { margin-top:12px; }
.rt-ucr-entry { margin-bottom:10px; }
.rt-ucr-entry:last-child { margin-bottom:0; }
.rt-ucr-eh { display:flex; justify-content:space-between; align-items:baseline; gap:8px; }
.rt-ucr-role { font-weight:600; font-size:9.5pt; color:#0f172a; }
.rt-ucr-dates { font-size:8pt; color:#6b7280; white-space:nowrap; flex-shrink:0; }
.rt-ucr-org { font-size:8.5pt; color:#4b5563; margin-top:1px; }
.rt-ucr-bullets { margin:4px 0 0 14px; padding:0; list-style:disc; color:#374151; }
.rt-ucr-bullets li { font-size:9pt; line-height:1.55; margin-bottom:2px; }
.rt-ucr-summary { font-size:9.5pt; line-height:1.65; color:#374151; }
`

export function UAECreativeTemplate({ data }: TemplateProps) {
  const c = data.customization || {}
  const accent = c.primaryColor || '#7c3aed'
  const font = c.fontFamily || "'Poppins','Helvetica Neue',Arial,sans-serif"
  const textColor = c.textColor || '#1f2937'
  const fontSize = c.fontSize ? `${c.fontSize}pt` : '9.5pt'

  const overrides = `
    .rt-ucr { color:${textColor}; font-family:${font}; font-size:${fontSize}; }
    .rt-ucr-stitle { color:${accent}; }
  `

  const dr = (s: string, e: string | null, cur: boolean) =>
    `${s}${s && (cur || e) ? ' – ' : ''}${cur ? 'Present' : e || ''}`

  const photo = data.personalInfo.photo

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONTS + CSS + overrides }} />
      <div className="rt-ucr">
        <div className="rt-ucr-sidebar">
          {photo && <img src={photo} alt="Photo" className="rt-ucr-photo" />}
          <div className="rt-ucr-name">{data.personalInfo.fullName || 'Your Name'}</div>
          <div className="rt-ucr-tagline">Creative Professional</div>

          <div className="rt-ucr-stitle-s">Contact</div>
          {data.personalInfo.email && <div className="rt-ucr-contact-item">{data.personalInfo.email}</div>}
          {data.personalInfo.phone && <div className="rt-ucr-contact-item">{data.personalInfo.phone}</div>}
          {data.personalInfo.location && <div className="rt-ucr-contact-item">{data.personalInfo.location}</div>}
          {data.personalInfo.linkedIn && <div className="rt-ucr-contact-item">{data.personalInfo.linkedIn.replace(/^https?:\/\//, '')}</div>}
          {data.personalInfo.website && <div className="rt-ucr-contact-item">{data.personalInfo.website.replace(/^https?:\/\//, '')}</div>}

          {data.skills.length > 0 && (
            <>
              <div className="rt-ucr-stitle-s">Skills</div>
              {data.skills.flatMap(g => g.items).map((item, i) => (
                <span key={i} className="rt-ucr-pill-s">{item}</span>
              ))}
            </>
          )}

          {data.languages.length > 0 && (
            <>
              <div className="rt-ucr-stitle-s">Languages</div>
              {data.languages.map((l, i) => (
                <div key={i} className="rt-ucr-lang-s">{l.language} ({l.proficiency})</div>
              ))}
            </>
          )}
        </div>

        <div className="rt-ucr-main">
          {data.summary && (
            <div className="rt-ucr-section">
              <div className="rt-ucr-stitle">About</div>
              <p className="rt-ucr-summary">{data.summary}</p>
            </div>
          )}

          {data.workExperience.length > 0 && (
            <div className="rt-ucr-section">
              <div className="rt-ucr-stitle">Experience</div>
              {data.workExperience.map((exp, i) => (
                <div key={i} className="rt-ucr-entry">
                  <div className="rt-ucr-eh">
                    <span className="rt-ucr-role">{exp.position || 'Position'}</span>
                    <span className="rt-ucr-dates">{dr(exp.startDate, exp.endDate, exp.current)}</span>
                  </div>
                  <div className="rt-ucr-org">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                  {exp.description.filter(Boolean).length > 0 && (
                    <ul className="rt-ucr-bullets">
                      {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {data.education.length > 0 && (
            <div className="rt-ucr-section">
              <div className="rt-ucr-stitle">Education</div>
              {data.education.map((ed, i) => (
                <div key={i} className="rt-ucr-entry">
                  <div className="rt-ucr-eh">
                    <span className="rt-ucr-role">{ed.degree}{ed.field ? `, ${ed.field}` : ''}</span>
                    <span className="rt-ucr-dates">{ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}</span>
                  </div>
                  <div className="rt-ucr-org">{ed.institution}{ed.gpa ? ` · GPA ${ed.gpa}` : ''}</div>
                </div>
              ))}
            </div>
          )}

          {data.certifications.length > 0 && (
            <div className="rt-ucr-section">
              <div className="rt-ucr-stitle">Certifications</div>
              {data.certifications.map((cert, i) => (
                <div key={i} className="rt-ucr-entry">
                  <div className="rt-ucr-eh">
                    <span className="rt-ucr-role">{cert.name}</span>
                    {cert.date && <span className="rt-ucr-dates">{cert.date}</span>}
                  </div>
                  {cert.issuer && <div className="rt-ucr-org">{cert.issuer}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
