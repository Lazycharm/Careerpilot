/**
 * ATS Tech — Technical skills first, ATS-safe, keyword-dense, no visual clutter.
 * UAE tech roles: GITEX companies, ADNOC Digital, Careem, Talabat, etc.
 * Category: ats | Ideal for: software engineers, data scientists, IT roles
 */
import type { TemplateProps } from '../types'

const CSS = `
.rt-atec {
  font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;
  font-size:10pt;
  line-height:1.5;
  color:#000000;
  background:#ffffff;
  width:210mm;
  min-height:297mm;
  padding:18mm 18mm;
  box-sizing:border-box;
}
.rt-atec-name { font-size:16pt; font-weight:bold; margin-bottom:2px; }
.rt-atec-contact { font-size:9.5pt; margin-bottom:10px; }
.rt-atec-rule { border:none; border-top:2px solid #000; margin:0 0 12px; }
.rt-atec-section { margin-top:12px; }
.rt-atec-stitle { font-size:10.5pt; font-weight:bold; text-transform:uppercase; border-bottom:1px solid #000; padding-bottom:2px; margin-bottom:6px; letter-spacing:0.3px; }
.rt-atec-skills-block { margin-bottom:3px; }
.rt-atec-skill-line { font-size:10pt; margin-bottom:2px; }
.rt-atec-skill-bold { font-weight:bold; }
.rt-atec-entry { margin-bottom:10px; }
.rt-atec-entry:last-child { margin-bottom:0; }
.rt-atec-role { font-weight:bold; font-size:10pt; }
.rt-atec-meta { font-size:9.5pt; }
.rt-atec-bullets { margin:4px 0 0 18px; padding:0; list-style:disc; }
.rt-atec-bullets li { font-size:9.5pt; line-height:1.5; margin-bottom:2px; }
.rt-atec-summary { font-size:10pt; line-height:1.6; }
.rt-atec-langs { font-size:10pt; }
`

export function ATSTechTemplate({ data }: TemplateProps) {
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
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="rt-atec">
        <div className="rt-atec-name">{data.personalInfo.fullName || 'Your Name'}</div>
        <div className="rt-atec-contact">{contacts.join('  |  ')}</div>
        <hr className="rt-atec-rule" />

        {/* Skills first for tech ATS — keyword scanning prioritizes top of document */}
        {data.skills.length > 0 && (
          <div className="rt-atec-section">
            <div className="rt-atec-stitle">Technical Skills</div>
            {data.skills.map((g, i) => (
              <div key={i} className="rt-atec-skill-line">
                {g.category && <span className="rt-atec-skill-bold">{g.category}: </span>}
                <span>{g.items.join(', ')}</span>
              </div>
            ))}
          </div>
        )}

        {data.summary && (
          <div className="rt-atec-section">
            <div className="rt-atec-stitle">Summary</div>
            <p className="rt-atec-summary">{data.summary}</p>
          </div>
        )}

        {data.workExperience.length > 0 && (
          <div className="rt-atec-section">
            <div className="rt-atec-stitle">Experience</div>
            {data.workExperience.map((exp, i) => (
              <div key={i} className="rt-atec-entry">
                <div className="rt-atec-role">{exp.position || 'Position'}</div>
                <div className="rt-atec-meta">{exp.company}{exp.location ? ` | ${exp.location}` : ''}  |  {dr(exp.startDate, exp.endDate, exp.current)}</div>
                {exp.description.filter(Boolean).length > 0 && (
                  <ul className="rt-atec-bullets">
                    {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="rt-atec-section">
            <div className="rt-atec-stitle">Education</div>
            {data.education.map((ed, i) => (
              <div key={i} className="rt-atec-entry">
                <div className="rt-atec-role">{ed.degree}{ed.field ? `, ${ed.field}` : ''}</div>
                <div className="rt-atec-meta">{ed.institution}  |  {ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}{ed.gpa ? `  |  GPA: ${ed.gpa}` : ''}</div>
              </div>
            ))}
          </div>
        )}

        {data.certifications.length > 0 && (
          <div className="rt-atec-section">
            <div className="rt-atec-stitle">Certifications</div>
            {data.certifications.map((cert, i) => (
              <div key={i} className="rt-atec-entry">
                <span className="rt-atec-role">{cert.name}</span>
                {cert.issuer ? ` — ${cert.issuer}` : ''}
                {cert.date ? ` (${cert.date})` : ''}
              </div>
            ))}
          </div>
        )}

        {data.languages.length > 0 && (
          <div className="rt-atec-section">
            <div className="rt-atec-stitle">Languages</div>
            <div className="rt-atec-langs">
              {data.languages.map((l) => `${l.language} (${l.proficiency})`).join('  |  ')}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
