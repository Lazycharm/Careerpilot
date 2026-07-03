/**
 * ATS Pure — 100% ATS-safe. Arial, no colors, no columns, plain dividers only.
 * UAE ATS rules: no images, no tables, no text boxes, single column, plain text.
 * Category: ats | Ideal for: any UAE role where ATS parsing is critical
 */
import type { TemplateProps } from '../types'

const CSS = `
.rt-ap {
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
.rt-ap-name { font-size:16pt; font-weight:bold; margin-bottom:4px; }
.rt-ap-contact { font-size:10pt; color:#000; margin-bottom:12px; }
.rt-ap-rule { border:none; border-top:1px solid #000; margin:10px 0; }
.rt-ap-stitle { font-size:11pt; font-weight:bold; text-transform:uppercase; margin-bottom:6px; }
.rt-ap-entry { margin-bottom:10px; }
.rt-ap-entry:last-child { margin-bottom:0; }
.rt-ap-role { font-weight:bold; font-size:10pt; }
.rt-ap-org-line { font-size:10pt; }
.rt-ap-dates { font-size:10pt; }
.rt-ap-bullets { margin:4px 0 0 20px; padding:0; list-style:disc; }
.rt-ap-bullets li { font-size:10pt; line-height:1.5; margin-bottom:2px; }
.rt-ap-summary { font-size:10pt; line-height:1.6; }
.rt-ap-skill-row { font-size:10pt; margin-bottom:3px; }
.rt-ap-langs { font-size:10pt; }
.rt-ap-section { margin-top:14px; }
`

export function ATSPureTemplate({ data }: TemplateProps) {
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
      <div className="rt-ap">
        {/* Plain text header — ATS reads this perfectly */}
        <div className="rt-ap-name">{data.personalInfo.fullName || 'Your Name'}</div>
        <div className="rt-ap-contact">{contacts.join('  |  ')}</div>
        <hr className="rt-ap-rule" />

        {data.summary && (
          <div className="rt-ap-section">
            <div className="rt-ap-stitle">Professional Summary</div>
            <p className="rt-ap-summary">{data.summary}</p>
          </div>
        )}

        {data.workExperience.length > 0 && (
          <div className="rt-ap-section">
            <div className="rt-ap-stitle">Work Experience</div>
            {data.workExperience.map((exp, i) => (
              <div key={i} className="rt-ap-entry">
                <div className="rt-ap-role">{exp.position || 'Position'}</div>
                <div className="rt-ap-org-line">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                <div className="rt-ap-dates">{dr(exp.startDate, exp.endDate, exp.current)}</div>
                {exp.description.filter(Boolean).length > 0 && (
                  <ul className="rt-ap-bullets">
                    {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="rt-ap-section">
            <div className="rt-ap-stitle">Education</div>
            {data.education.map((ed, i) => (
              <div key={i} className="rt-ap-entry">
                <div className="rt-ap-role">{ed.degree}{ed.field ? `, ${ed.field}` : ''}</div>
                <div className="rt-ap-org-line">{ed.institution}</div>
                <div className="rt-ap-dates">{ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}{ed.gpa ? `  |  GPA: ${ed.gpa}` : ''}</div>
              </div>
            ))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="rt-ap-section">
            <div className="rt-ap-stitle">Skills</div>
            {data.skills.map((g, i) => (
              <div key={i} className="rt-ap-skill-row">
                {g.category ? `${g.category}: ` : ''}{g.items.join(', ')}
              </div>
            ))}
          </div>
        )}

        {data.certifications.length > 0 && (
          <div className="rt-ap-section">
            <div className="rt-ap-stitle">Certifications</div>
            {data.certifications.map((cert, i) => (
              <div key={i} className="rt-ap-entry">
                <div className="rt-ap-role">{cert.name}</div>
                {cert.issuer && <div className="rt-ap-org-line">{cert.issuer}</div>}
                {cert.date && <div className="rt-ap-dates">{cert.date}</div>}
              </div>
            ))}
          </div>
        )}

        {data.languages.length > 0 && (
          <div className="rt-ap-section">
            <div className="rt-ap-stitle">Languages</div>
            <div className="rt-ap-langs">
              {data.languages.map((l) => `${l.language} (${l.proficiency})`).join('  |  ')}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
