/**
 * UAE Education — Academic blue, research-focused, publication-ready format.
 * Category: specialty | Ideal for: teachers, professors, academic admins, trainers
 */
import type { TemplateProps } from '../types'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');`

const CSS = `
.rt-ued {
  font-family:'Inter','Helvetica Neue',Arial,sans-serif;
  font-size:9.5pt;
  line-height:1.65;
  color:#1e293b;
  background:#ffffff;
  width:210mm;
  min-height:297mm;
  padding:13mm 15mm;
  box-sizing:border-box;
}
.rt-ued-header { border-bottom:2px solid #1e40af; padding-bottom:10px; margin-bottom:14px; }
.rt-ued-name { font-family:'Source Serif 4',Georgia,serif; font-size:24pt; font-weight:700; color:#0f172a; letter-spacing:-0.2px; line-height:1.1; margin-bottom:5px; }
.rt-ued-contact { display:flex; flex-wrap:wrap; gap:0; font-size:8.5pt; color:#475569; }
.rt-ued-ci+.rt-ued-ci::before { content:" | "; color:#94a3b8; }
.rt-ued-section { margin-top:13px; }
.rt-ued-stitle { font-family:'Source Serif 4',Georgia,serif; font-size:11pt; font-weight:600; color:#1e40af; border-bottom:1px solid #bfdbfe; padding-bottom:2px; margin-bottom:8px; }
.rt-ued-entry { margin-bottom:9px; }
.rt-ued-entry:last-child { margin-bottom:0; }
.rt-ued-eh { display:flex; justify-content:space-between; align-items:baseline; gap:8px; }
.rt-ued-role { font-weight:600; font-size:10pt; color:#0f172a; }
.rt-ued-dates { font-size:8pt; color:#64748b; white-space:nowrap; flex-shrink:0; font-style:italic; }
.rt-ued-org { font-size:9pt; color:#334155; margin-top:1px; }
.rt-ued-bullets { margin:4px 0 0 15px; padding:0; list-style:disc; color:#334155; }
.rt-ued-bullets li { font-size:9pt; line-height:1.6; margin-bottom:2px; }
.rt-ued-summary { font-size:9.5pt; line-height:1.7; color:#334155; }
.rt-ued-skill-row { font-size:9pt; margin-bottom:3px; }
.rt-ued-skill-cat { font-weight:600; color:#0f172a; }
.rt-ued-langs { font-size:9pt; color:#475569; }
`

export function UAEEducationTemplate({ data }: TemplateProps) {
  const c = data.customization || {}
  const accent = c.primaryColor || '#1e40af'
  const font = c.fontFamily || "'Inter','Helvetica Neue',Arial,sans-serif"
  const textColor = c.textColor || '#1e293b'
  const fontSize = c.fontSize ? `${c.fontSize}pt` : '9.5pt'

  const overrides = `
    .rt-ued { color:${textColor}; font-family:${font}; font-size:${fontSize}; }
    .rt-ued-header { border-bottom-color:${accent}; }
    .rt-ued-stitle { color:${accent}; border-bottom-color:${accent}30; }
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
      <div className="rt-ued">
        <div className="rt-ued-header">
          <div className="rt-ued-name">{data.personalInfo.fullName || 'Your Name'}</div>
          <div className="rt-ued-contact">
            {contacts.map((item, i) => <span key={i} className="rt-ued-ci">{item}</span>)}
          </div>
        </div>

        {data.summary && (
          <div className="rt-ued-section">
            <div className="rt-ued-stitle">Teaching Philosophy</div>
            <p className="rt-ued-summary">{data.summary}</p>
          </div>
        )}

        {data.workExperience.length > 0 && (
          <div className="rt-ued-section">
            <div className="rt-ued-stitle">Teaching & Professional Experience</div>
            {data.workExperience.map((exp, i) => (
              <div key={i} className="rt-ued-entry">
                <div className="rt-ued-eh">
                  <span className="rt-ued-role">{exp.position || 'Position'}</span>
                  <span className="rt-ued-dates">{dr(exp.startDate, exp.endDate, exp.current)}</span>
                </div>
                <div className="rt-ued-org">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                {exp.description.filter(Boolean).length > 0 && (
                  <ul className="rt-ued-bullets">
                    {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="rt-ued-section">
            <div className="rt-ued-stitle">Academic Qualifications</div>
            {data.education.map((ed, i) => (
              <div key={i} className="rt-ued-entry">
                <div className="rt-ued-eh">
                  <span className="rt-ued-role">{ed.degree}{ed.field ? `, ${ed.field}` : ''}</span>
                  <span className="rt-ued-dates">{ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}</span>
                </div>
                <div className="rt-ued-org">{ed.institution}{ed.gpa ? ` · GPA ${ed.gpa}` : ''}</div>
              </div>
            ))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="rt-ued-section">
            <div className="rt-ued-stitle">Skills & Competencies</div>
            {data.skills.map((g, i) => (
              <div key={i} className="rt-ued-skill-row">
                <span className="rt-ued-skill-cat">{g.category}: </span>
                <span>{g.items.join(', ')}</span>
              </div>
            ))}
          </div>
        )}

        {data.certifications.length > 0 && (
          <div className="rt-ued-section">
            <div className="rt-ued-stitle">Certifications & Training</div>
            {data.certifications.map((cert, i) => (
              <div key={i} className="rt-ued-entry">
                <div className="rt-ued-eh">
                  <span className="rt-ued-role">{cert.name}</span>
                  {cert.date && <span className="rt-ued-dates">{cert.date}</span>}
                </div>
                {cert.issuer && <div className="rt-ued-org">{cert.issuer}</div>}
              </div>
            ))}
          </div>
        )}

        {data.languages.length > 0 && (
          <div className="rt-ued-section">
            <div className="rt-ued-stitle">Languages</div>
            <div className="rt-ued-langs">
              {data.languages.map((l) => `${l.language} (${l.proficiency})`).join('   ·   ')}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
