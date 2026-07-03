/**
 * ATS Management — Leadership-focused ATS resume, achievement metrics prominent.
 * UAE management: EXPO legacy firms, DEWA, Etihad, Emirates, Abu Dhabi HC.
 * Category: ats | Ideal for: managers, directors, department heads, C-suite ATS
 */
import type { TemplateProps } from '../types'

const CSS = `
.rt-amgt {
  font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;
  font-size:10pt;
  line-height:1.5;
  color:#000000;
  background:#ffffff;
  width:210mm;
  min-height:297mm;
  padding:19mm 19mm;
  box-sizing:border-box;
}
.rt-amgt-name { font-size:17pt; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:3px; }
.rt-amgt-contact { font-size:9.5pt; margin-bottom:0; }
.rt-amgt-rule { border:none; border-top:3px solid #000; margin:8px 0 0; }
.rt-amgt-rule2 { border:none; border-top:1px solid #000; margin:1px 0 12px; }
.rt-amgt-section { margin-top:11px; }
.rt-amgt-stitle { font-size:10pt; font-weight:bold; text-transform:uppercase; letter-spacing:0.7px; border-bottom:1.5px solid #000; padding-bottom:1px; margin-bottom:7px; }
.rt-amgt-summary { font-size:10pt; line-height:1.6; }
.rt-amgt-entry { margin-bottom:10px; }
.rt-amgt-entry:last-child { margin-bottom:0; }
.rt-amgt-eh { display:flex; justify-content:space-between; align-items:baseline; }
.rt-amgt-role { font-weight:bold; font-size:10pt; }
.rt-amgt-dates { font-size:9.5pt; white-space:nowrap; }
.rt-amgt-org { font-size:9.5pt; font-style:italic; }
.rt-amgt-bullets { margin:4px 0 0 18px; padding:0; list-style:disc; }
.rt-amgt-bullets li { font-size:9.5pt; line-height:1.5; margin-bottom:2px; }
.rt-amgt-skill-row { font-size:10pt; margin-bottom:2px; }
.rt-amgt-langs { font-size:10pt; }
`

export function ATSManagementTemplate({ data }: TemplateProps) {
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
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="rt-amgt">
        <div className="rt-amgt-name">{data.personalInfo.fullName || 'Your Name'}</div>
        <div className="rt-amgt-contact">{contacts.join('  |  ')}</div>
        <hr className="rt-amgt-rule" />
        <hr className="rt-amgt-rule2" />

        {data.summary && (
          <div className="rt-amgt-section">
            <div className="rt-amgt-stitle">Executive Summary</div>
            <p className="rt-amgt-summary">{data.summary}</p>
          </div>
        )}

        {data.workExperience.length > 0 && (
          <div className="rt-amgt-section">
            <div className="rt-amgt-stitle">Professional Experience</div>
            {data.workExperience.map((exp, i) => (
              <div key={i} className="rt-amgt-entry">
                <div className="rt-amgt-eh">
                  <span className="rt-amgt-role">{exp.position || 'Position'}</span>
                  <span className="rt-amgt-dates">{dr(exp.startDate, exp.endDate, exp.current)}</span>
                </div>
                <div className="rt-amgt-org">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                {exp.description.filter(Boolean).length > 0 && (
                  <ul className="rt-amgt-bullets">
                    {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="rt-amgt-section">
            <div className="rt-amgt-stitle">Core Competencies</div>
            {data.skills.map((g, i) => (
              <div key={i} className="rt-amgt-skill-row">
                {g.category ? `${g.category}: ` : ''}{g.items.join(' | ')}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="rt-amgt-section">
            <div className="rt-amgt-stitle">Education</div>
            {data.education.map((ed, i) => (
              <div key={i} className="rt-amgt-entry">
                <div className="rt-amgt-eh">
                  <span className="rt-amgt-role">{ed.degree}{ed.field ? `, ${ed.field}` : ''}</span>
                  <span className="rt-amgt-dates">{ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}</span>
                </div>
                <div className="rt-amgt-org">{ed.institution}{ed.gpa ? ` | GPA: ${ed.gpa}` : ''}</div>
              </div>
            ))}
          </div>
        )}

        {data.certifications.length > 0 && (
          <div className="rt-amgt-section">
            <div className="rt-amgt-stitle">Professional Development</div>
            {data.certifications.map((cert, i) => (
              <div key={i} className="rt-amgt-entry">
                <span className="rt-amgt-role">{cert.name}</span>
                {cert.issuer ? ` — ${cert.issuer}` : ''}
                {cert.date ? ` (${cert.date})` : ''}
              </div>
            ))}
          </div>
        )}

        {data.languages.length > 0 && (
          <div className="rt-amgt-section">
            <div className="rt-amgt-stitle">Languages</div>
            <div className="rt-amgt-langs">
              {data.languages.map((l) => `${l.language}: ${l.proficiency}`).join('   |   ')}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
