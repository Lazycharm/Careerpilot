/**
 * UAE Photo Modern — Teal header, circular photo top-right, two-column header.
 * Category: modern | supportsPhoto: true | Ideal for: management, business dev
 */
import type { TemplateProps } from '../types'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800&display=swap');`

const CSS = `
.rt-upm {
  font-family:'Nunito Sans','Helvetica Neue',Arial,sans-serif;
  font-size:9.5pt;
  line-height:1.55;
  color:#1f2937;
  background:#ffffff;
  width:210mm;
  min-height:297mm;
  padding:0;
  box-sizing:border-box;
}
.rt-upm-header { background:#0e7490; padding:12mm 14mm 10mm; display:flex; align-items:center; justify-content:space-between; gap:14px; }
.rt-upm-header-left { flex:1; }
.rt-upm-photo { width:72px; height:72px; border-radius:50%; border:3px solid rgba(255,255,255,0.5); object-fit:cover; flex-shrink:0; }
.rt-upm-photo-placeholder { width:72px; height:72px; border-radius:50%; background:rgba(255,255,255,0.2); flex-shrink:0; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.6); font-size:9pt; }
.rt-upm-name { font-size:22pt; font-weight:800; color:#fff; line-height:1.1; margin-bottom:4px; }
.rt-upm-contact { display:flex; flex-wrap:wrap; gap:0; font-size:8.5pt; color:#a5f3fc; }
.rt-upm-ci+.rt-upm-ci::before { content:" · "; }
.rt-upm-body { padding:10mm 14mm; }
.rt-upm-section { margin-top:11px; }
.rt-upm-stitle { font-size:8pt; font-weight:700; color:#0e7490; text-transform:uppercase; letter-spacing:1.5px; border-bottom:2px solid #cffafe; padding-bottom:3px; margin-bottom:7px; }
.rt-upm-entry { margin-bottom:9px; }
.rt-upm-entry:last-child { margin-bottom:0; }
.rt-upm-eh { display:flex; justify-content:space-between; align-items:baseline; gap:8px; }
.rt-upm-role { font-weight:700; font-size:9.5pt; color:#0f172a; }
.rt-upm-dates { font-size:8pt; color:#6b7280; white-space:nowrap; flex-shrink:0; }
.rt-upm-org { font-size:8.5pt; color:#4b5563; margin-top:1px; }
.rt-upm-bullets { margin:4px 0 0 14px; padding:0; list-style:disc; color:#374151; }
.rt-upm-bullets li { font-size:9pt; line-height:1.55; margin-bottom:2px; }
.rt-upm-summary { font-size:9.5pt; line-height:1.65; color:#374151; }
.rt-upm-skills-grid { display:flex; flex-wrap:wrap; gap:3px; }
.rt-upm-pill { background:#ecfeff; border:1px solid #67e8f9; border-radius:10px; padding:2px 8px; font-size:8pt; color:#0e7490; font-weight:600; }
.rt-upm-langs { font-size:9pt; color:#4b5563; }
`

export function UAEPhotoModernTemplate({ data }: TemplateProps) {
  const c = data.customization || {}
  const accent = c.primaryColor || '#0e7490'
  const font = c.fontFamily || "'Nunito Sans','Helvetica Neue',Arial,sans-serif"
  const textColor = c.textColor || '#1f2937'
  const fontSize = c.fontSize ? `${c.fontSize}pt` : '9.5pt'

  const overrides = `
    .rt-upm { color:${textColor}; font-family:${font}; font-size:${fontSize}; }
    .rt-upm-header { background:${accent}; }
    .rt-upm-stitle { color:${accent}; }
    .rt-upm-pill { border-color:${accent}40; color:${accent}; background:${accent}10; }
  `

  const dr = (s: string, e: string | null, cur: boolean) =>
    `${s}${s && (cur || e) ? ' – ' : ''}${cur ? 'Present' : e || ''}`

  const contacts = [
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.location,
    data.personalInfo.linkedIn?.replace(/^https?:\/\//, ''),
  ].filter(Boolean) as string[]

  const photo = data.personalInfo.photo

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONTS + CSS + overrides }} />
      <div className="rt-upm">
        <div className="rt-upm-header">
          <div className="rt-upm-header-left">
            <div className="rt-upm-name">{data.personalInfo.fullName || 'Your Name'}</div>
            <div className="rt-upm-contact">
              {contacts.map((item, i) => <span key={i} className="rt-upm-ci">{item}</span>)}
            </div>
          </div>
          {photo
            ? <img src={photo} alt="Photo" className="rt-upm-photo" />
            : <div className="rt-upm-photo-placeholder">Photo</div>
          }
        </div>
        <div className="rt-upm-body">
          {data.summary && (
            <div className="rt-upm-section">
              <div className="rt-upm-stitle">Profile</div>
              <p className="rt-upm-summary">{data.summary}</p>
            </div>
          )}

          {data.workExperience.length > 0 && (
            <div className="rt-upm-section">
              <div className="rt-upm-stitle">Experience</div>
              {data.workExperience.map((exp, i) => (
                <div key={i} className="rt-upm-entry">
                  <div className="rt-upm-eh">
                    <span className="rt-upm-role">{exp.position || 'Position'}</span>
                    <span className="rt-upm-dates">{dr(exp.startDate, exp.endDate, exp.current)}</span>
                  </div>
                  <div className="rt-upm-org">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                  {exp.description.filter(Boolean).length > 0 && (
                    <ul className="rt-upm-bullets">
                      {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {data.skills.length > 0 && (
            <div className="rt-upm-section">
              <div className="rt-upm-stitle">Skills</div>
              <div className="rt-upm-skills-grid">
                {data.skills.flatMap(g => g.items).map((item, i) => (
                  <span key={i} className="rt-upm-pill">{item}</span>
                ))}
              </div>
            </div>
          )}

          {data.education.length > 0 && (
            <div className="rt-upm-section">
              <div className="rt-upm-stitle">Education</div>
              {data.education.map((ed, i) => (
                <div key={i} className="rt-upm-entry">
                  <div className="rt-upm-eh">
                    <span className="rt-upm-role">{ed.degree}{ed.field ? `, ${ed.field}` : ''}</span>
                    <span className="rt-upm-dates">{ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}</span>
                  </div>
                  <div className="rt-upm-org">{ed.institution}</div>
                </div>
              ))}
            </div>
          )}

          {data.certifications.length > 0 && (
            <div className="rt-upm-section">
              <div className="rt-upm-stitle">Certifications</div>
              {data.certifications.map((cert, i) => (
                <div key={i} className="rt-upm-entry">
                  <div className="rt-upm-eh">
                    <span className="rt-upm-role">{cert.name}</span>
                    {cert.date && <span className="rt-upm-dates">{cert.date}</span>}
                  </div>
                  {cert.issuer && <div className="rt-upm-org">{cert.issuer}</div>}
                </div>
              ))}
            </div>
          )}

          {data.languages.length > 0 && (
            <div className="rt-upm-section">
              <div className="rt-upm-stitle">Languages</div>
              <div className="rt-upm-langs">
                {data.languages.map((l) => `${l.language} (${l.proficiency})`).join('   ·   ')}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
