/**
 * ATS Finance — ATS-safe format optimized for UAE banking/finance ATS systems.
 * Quantified achievements prominent, conservative structure.
 * Category: ats | Ideal for: ADCB, Emirates NBD, FAB, Mashreq, DIFC firms
 */
import type { TemplateProps } from '../types'

const CSS = `
.rt-afin {
  font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;
  font-size:10pt;
  line-height:1.5;
  color:#000000;
  background:#ffffff;
  width:210mm;
  min-height:297mm;
  padding:20mm 20mm;
  box-sizing:border-box;
}
.rt-afin-header { margin-bottom:10px; }
.rt-afin-name { font-size:15pt; font-weight:bold; }
.rt-afin-contact { font-size:10pt; margin-top:3px; }
.rt-afin-rule { border:none; border-top:1.5px solid #000; margin:8px 0; }
.rt-afin-section { margin-top:12px; }
.rt-afin-stitle { font-size:10.5pt; font-weight:bold; text-transform:uppercase; background:#000; color:#fff; padding:2px 6px; display:inline-block; margin-bottom:6px; }
.rt-afin-entry { margin-bottom:10px; }
.rt-afin-entry:last-child { margin-bottom:0; }
.rt-afin-role { font-weight:bold; font-size:10pt; }
.rt-afin-org { font-size:10pt; }
.rt-afin-dates { font-size:9.5pt; }
.rt-afin-bullets { margin:4px 0 0 18px; padding:0; list-style:disc; }
.rt-afin-bullets li { font-size:10pt; line-height:1.5; margin-bottom:2px; }
.rt-afin-summary { font-size:10pt; line-height:1.6; }
.rt-afin-skill-row { font-size:10pt; margin-bottom:2px; }
.rt-afin-langs { font-size:10pt; }
`

export function ATSFinanceTemplate({ data }: TemplateProps) {
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
      <div className="rt-afin">
        <div className="rt-afin-header">
          <div className="rt-afin-name">{data.personalInfo.fullName || 'Your Name'}</div>
          <div className="rt-afin-contact">{contacts.join('  •  ')}</div>
        </div>
        <hr className="rt-afin-rule" />

        {data.summary && (
          <div className="rt-afin-section">
            <div className="rt-afin-stitle">Professional Summary</div>
            <p className="rt-afin-summary">{data.summary}</p>
          </div>
        )}

        {data.workExperience.length > 0 && (
          <div className="rt-afin-section">
            <div className="rt-afin-stitle">Professional Experience</div>
            {data.workExperience.map((exp, i) => (
              <div key={i} className="rt-afin-entry">
                <div className="rt-afin-role">{exp.position || 'Position'}</div>
                <div className="rt-afin-org">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                <div className="rt-afin-dates">{dr(exp.startDate, exp.endDate, exp.current)}</div>
                {exp.description.filter(Boolean).length > 0 && (
                  <ul className="rt-afin-bullets">
                    {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="rt-afin-section">
            <div className="rt-afin-stitle">Education</div>
            {data.education.map((ed, i) => (
              <div key={i} className="rt-afin-entry">
                <div className="rt-afin-role">{ed.degree}{ed.field ? `, ${ed.field}` : ''}</div>
                <div className="rt-afin-org">{ed.institution}</div>
                <div className="rt-afin-dates">{ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}{ed.gpa ? `  |  GPA: ${ed.gpa}` : ''}</div>
              </div>
            ))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="rt-afin-section">
            <div className="rt-afin-stitle">Skills & Expertise</div>
            {data.skills.map((g, i) => (
              <div key={i} className="rt-afin-skill-row">
                {g.category ? `${g.category}: ` : ''}{g.items.join(' | ')}
              </div>
            ))}
          </div>
        )}

        {data.certifications.length > 0 && (
          <div className="rt-afin-section">
            <div className="rt-afin-stitle">Certifications</div>
            {data.certifications.map((cert, i) => (
              <div key={i} className="rt-afin-entry">
                <div className="rt-afin-role">{cert.name}{cert.issuer ? ` — ${cert.issuer}` : ''}{cert.date ? ` (${cert.date})` : ''}</div>
              </div>
            ))}
          </div>
        )}

        {data.languages.length > 0 && (
          <div className="rt-afin-section">
            <div className="rt-afin-stitle">Languages</div>
            <div className="rt-afin-langs">
              {data.languages.map((l) => `${l.language}: ${l.proficiency}`).join('   |   ')}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
