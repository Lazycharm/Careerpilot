/**
 * UAE Executive Photo — Premium serif + photo, gold accent, centered header.
 * Category: premium | Ideal for: C-suite, VPs, senior management, board positions
 */
import type { TemplateProps } from '../types'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Inter:wght@400;500;600&display=swap');`

const CSS = `
.rt-uep {
  font-family:'Inter','Helvetica Neue',Arial,sans-serif;
  font-size:9.5pt;
  line-height:1.55;
  color:#1e293b;
  background:#ffffff;
  width:210mm;
  min-height:297mm;
  padding:13mm 14mm;
  box-sizing:border-box;
}
.rt-uep-header { text-align:center; padding-bottom:12px; margin-bottom:14px; border-bottom:2px solid #b45309; }
.rt-uep-inner { display:flex; align-items:center; justify-content:center; gap:14px; margin-bottom:8px; }
.rt-uep-photo { width:72px; height:72px; border-radius:50%; object-fit:cover; border:3px solid #d97706; flex-shrink:0; }
.rt-uep-name { font-family:'Cormorant Garamond',Georgia,serif; font-size:30pt; font-weight:700; color:#0f172a; letter-spacing:-0.3px; line-height:1.1; margin-bottom:4px; }
.rt-uep-contact { display:flex; justify-content:center; flex-wrap:wrap; gap:0; font-size:8.5pt; color:#64748b; }
.rt-uep-ci+.rt-uep-ci::before { content:" · "; color:#b45309; }
.rt-uep-section { margin-top:12px; }
.rt-uep-stitle { font-family:'Cormorant Garamond',Georgia,serif; font-size:12pt; font-weight:600; color:#b45309; border-bottom:1px solid #fde68a; padding-bottom:3px; margin-bottom:8px; letter-spacing:0.5px; }
.rt-uep-entry { margin-bottom:10px; }
.rt-uep-entry:last-child { margin-bottom:0; }
.rt-uep-eh { display:flex; justify-content:space-between; align-items:baseline; gap:8px; }
.rt-uep-role { font-weight:600; font-size:10pt; color:#0f172a; }
.rt-uep-dates { font-size:8pt; color:#64748b; white-space:nowrap; flex-shrink:0; font-style:italic; }
.rt-uep-org { font-size:9pt; color:#475569; margin-top:1px; }
.rt-uep-bullets { margin:4px 0 0 15px; padding:0; list-style:disc; color:#334155; }
.rt-uep-bullets li { font-size:9pt; line-height:1.55; margin-bottom:2px; }
.rt-uep-summary { font-size:9.5pt; line-height:1.65; color:#334155; }
.rt-uep-skill-row { font-size:9pt; margin-bottom:3px; }
.rt-uep-skill-cat { font-weight:600; color:#0f172a; }
.rt-uep-langs { font-size:9pt; color:#475569; }
`

export function UAEPhotoExecutiveTemplate({ data }: TemplateProps) {
  const c = data.customization || {}
  const accent = c.primaryColor || '#b45309'
  const font = c.fontFamily || "'Inter','Helvetica Neue',Arial,sans-serif"
  const textColor = c.textColor || '#1e293b'
  const fontSize = c.fontSize ? `${c.fontSize}pt` : '9.5pt'

  const overrides = `
    .rt-uep { color:${textColor}; font-family:${font}; font-size:${fontSize}; }
    .rt-uep-header { border-bottom-color:${accent}; }
    .rt-uep-photo { border-color:${accent}; }
    .rt-uep-stitle { color:${accent}; border-bottom-color:${accent}40; }
    .rt-uep-ci+.rt-uep-ci::before { color:${accent}; }
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

  const photo = data.personalInfo.photo

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONTS + CSS + overrides }} />
      <div className="rt-uep">
        <div className="rt-uep-header">
          <div className="rt-uep-inner">
            {photo && <img src={photo} alt="Photo" className="rt-uep-photo" />}
            <div>
              <div className="rt-uep-name">{data.personalInfo.fullName || 'Your Name'}</div>
              <div className="rt-uep-contact">
                {contacts.map((item, i) => <span key={i} className="rt-uep-ci">{item}</span>)}
              </div>
            </div>
          </div>
        </div>

        {data.summary && (
          <div className="rt-uep-section">
            <div className="rt-uep-stitle">Executive Profile</div>
            <p className="rt-uep-summary">{data.summary}</p>
          </div>
        )}

        {data.workExperience.length > 0 && (
          <div className="rt-uep-section">
            <div className="rt-uep-stitle">Professional Experience</div>
            {data.workExperience.map((exp, i) => (
              <div key={i} className="rt-uep-entry">
                <div className="rt-uep-eh">
                  <span className="rt-uep-role">{exp.position || 'Position'}</span>
                  <span className="rt-uep-dates">{dr(exp.startDate, exp.endDate, exp.current)}</span>
                </div>
                <div className="rt-uep-org">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                {exp.description.filter(Boolean).length > 0 && (
                  <ul className="rt-uep-bullets">
                    {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="rt-uep-section">
            <div className="rt-uep-stitle">Education</div>
            {data.education.map((ed, i) => (
              <div key={i} className="rt-uep-entry">
                <div className="rt-uep-eh">
                  <span className="rt-uep-role">{ed.degree}{ed.field ? `, ${ed.field}` : ''}</span>
                  <span className="rt-uep-dates">{ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}</span>
                </div>
                <div className="rt-uep-org">{ed.institution}{ed.gpa ? ` · GPA ${ed.gpa}` : ''}</div>
              </div>
            ))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="rt-uep-section">
            <div className="rt-uep-stitle">Core Competencies</div>
            {data.skills.map((g, i) => (
              <div key={i} className="rt-uep-skill-row">
                <span className="rt-uep-skill-cat">{g.category}: </span>
                <span>{g.items.join(', ')}</span>
              </div>
            ))}
          </div>
        )}

        {data.certifications.length > 0 && (
          <div className="rt-uep-section">
            <div className="rt-uep-stitle">Certifications & Awards</div>
            {data.certifications.map((cert, i) => (
              <div key={i} className="rt-uep-entry">
                <div className="rt-uep-eh">
                  <span className="rt-uep-role">{cert.name}</span>
                  {cert.date && <span className="rt-uep-dates">{cert.date}</span>}
                </div>
                {cert.issuer && <div className="rt-uep-org">{cert.issuer}</div>}
              </div>
            ))}
          </div>
        )}

        {data.languages.length > 0 && (
          <div className="rt-uep-section">
            <div className="rt-uep-stitle">Languages</div>
            <div className="rt-uep-langs">
              {data.languages.map((l) => `${l.language} (${l.proficiency})`).join('   ·   ')}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
