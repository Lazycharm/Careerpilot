/**
 * UAE Startup — Bold orange accent, minimal lines, metrics-focused.
 * Category: modern | Ideal for: founders, startup employees, sales, business dev
 */
import type { TemplateProps } from '../types'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap');`

const CSS = `
.rt-ust {
  font-family:'Inter','Helvetica Neue',Arial,sans-serif;
  font-size:9.5pt;
  line-height:1.6;
  color:#111827;
  background:#ffffff;
  width:210mm;
  min-height:297mm;
  padding:13mm 15mm;
  box-sizing:border-box;
}
.rt-ust-name { font-size:30pt; font-weight:900; color:#0f172a; letter-spacing:-1px; line-height:1; margin-bottom:4px; }
.rt-ust-accent { display:inline-block; height:4px; background:#ea580c; width:60px; margin-bottom:6px; border-radius:2px; }
.rt-ust-contact { display:flex; flex-wrap:wrap; gap:0; font-size:8.5pt; color:#6b7280; margin-bottom:0; }
.rt-ust-ci+.rt-ust-ci::before { content:" / "; color:#d1d5db; }
.rt-ust-rule { border:none; border-top:1.5px solid #f3f4f6; margin:10px 0; }
.rt-ust-section { margin-top:12px; }
.rt-ust-stitle { font-size:7pt; font-weight:700; color:#ea580c; text-transform:uppercase; letter-spacing:3px; margin-bottom:8px; }
.rt-ust-entry { margin-bottom:9px; }
.rt-ust-entry:last-child { margin-bottom:0; }
.rt-ust-eh { display:flex; justify-content:space-between; align-items:baseline; gap:8px; }
.rt-ust-role { font-weight:700; font-size:10pt; color:#0f172a; }
.rt-ust-dates { font-size:8pt; color:#9ca3af; white-space:nowrap; flex-shrink:0; }
.rt-ust-org { font-size:9pt; color:#4b5563; margin-top:0; font-weight:500; }
.rt-ust-bullets { margin:4px 0 0 0; padding:0; list-style:none; color:#374151; }
.rt-ust-bullets li { font-size:9pt; line-height:1.55; margin-bottom:2px; padding-left:12px; position:relative; }
.rt-ust-bullets li::before { content:"▸"; position:absolute; left:0; color:#ea580c; font-size:8pt; }
.rt-ust-summary { font-size:9.5pt; line-height:1.65; color:#374151; }
.rt-ust-pills { display:flex; flex-wrap:wrap; gap:3px; }
.rt-ust-pill { background:#fff7ed; border:1px solid #fdba74; border-radius:3px; padding:2px 8px; font-size:8pt; color:#9a3412; font-weight:500; }
.rt-ust-langs { font-size:9pt; color:#4b5563; }
`

export function UAEStartupTemplate({ data }: TemplateProps) {
  const c = data.customization || {}
  const accent = c.primaryColor || '#ea580c'
  const font = c.fontFamily || "'Inter','Helvetica Neue',Arial,sans-serif"
  const textColor = c.textColor || '#111827'
  const fontSize = c.fontSize ? `${c.fontSize}pt` : '9.5pt'

  const overrides = `
    .rt-ust { color:${textColor}; font-family:${font}; font-size:${fontSize}; }
    .rt-ust-accent { background:${accent}; }
    .rt-ust-stitle { color:${accent}; }
    .rt-ust-bullets li::before { color:${accent}; }
    .rt-ust-pill { border-color:${accent}50; color:${accent}; background:${accent}08; }
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
      <div className="rt-ust">
        <div className="rt-ust-name">{data.personalInfo.fullName || 'Your Name'}</div>
        <div className="rt-ust-accent" />
        <div className="rt-ust-contact">
          {contacts.map((item, i) => <span key={i} className="rt-ust-ci">{item}</span>)}
        </div>
        <hr className="rt-ust-rule" />

        {data.summary && (
          <div className="rt-ust-section">
            <div className="rt-ust-stitle">About</div>
            <p className="rt-ust-summary">{data.summary}</p>
          </div>
        )}

        {data.workExperience.length > 0 && (
          <div className="rt-ust-section">
            <div className="rt-ust-stitle">Experience</div>
            {data.workExperience.map((exp, i) => (
              <div key={i} className="rt-ust-entry">
                <div className="rt-ust-eh">
                  <span className="rt-ust-role">{exp.position || 'Position'}</span>
                  <span className="rt-ust-dates">{dr(exp.startDate, exp.endDate, exp.current)}</span>
                </div>
                <div className="rt-ust-org">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                {exp.description.filter(Boolean).length > 0 && (
                  <ul className="rt-ust-bullets">
                    {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="rt-ust-section">
            <div className="rt-ust-stitle">Skills</div>
            <div className="rt-ust-pills">
              {data.skills.flatMap(g => g.items).map((item, i) => (
                <span key={i} className="rt-ust-pill">{item}</span>
              ))}
            </div>
          </div>
        )}

        {data.education.length > 0 && (
          <div className="rt-ust-section">
            <div className="rt-ust-stitle">Education</div>
            {data.education.map((ed, i) => (
              <div key={i} className="rt-ust-entry">
                <div className="rt-ust-eh">
                  <span className="rt-ust-role">{ed.degree}{ed.field ? `, ${ed.field}` : ''}</span>
                  <span className="rt-ust-dates">{ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}</span>
                </div>
                <div className="rt-ust-org">{ed.institution}</div>
              </div>
            ))}
          </div>
        )}

        {data.certifications.length > 0 && (
          <div className="rt-ust-section">
            <div className="rt-ust-stitle">Certifications</div>
            {data.certifications.map((cert, i) => (
              <div key={i} className="rt-ust-entry">
                <div className="rt-ust-eh">
                  <span className="rt-ust-role">{cert.name}</span>
                  {cert.date && <span className="rt-ust-dates">{cert.date}</span>}
                </div>
                {cert.issuer && <div className="rt-ust-org">{cert.issuer}</div>}
              </div>
            ))}
          </div>
        )}

        {data.languages.length > 0 && (
          <div className="rt-ust-section">
            <div className="rt-ust-stitle">Languages</div>
            <div className="rt-ust-langs">
              {data.languages.map((l) => `${l.language} (${l.proficiency})`).join('   ·   ')}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
