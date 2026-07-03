/**
 * ATS Professional — Clean structure, Calibri-like, subtle hierarchy, ATS-safe.
 * Passes UAE ATS filters while maintaining readability for human reviewers.
 * Category: ats | Ideal for: general professional roles in UAE
 */
import type { TemplateProps } from '../types'

const CSS = `
.rt-apro {
  font-family:'Calibri','Carlito',Arial,'Helvetica Neue',sans-serif;
  font-size:10pt;
  line-height:1.5;
  color:#1a1a1a;
  background:#ffffff;
  width:210mm;
  min-height:297mm;
  padding:18mm 18mm;
  box-sizing:border-box;
}
.rt-apro-name { font-size:18pt; font-weight:bold; color:#000; margin-bottom:3px; }
.rt-apro-contact { font-size:9.5pt; color:#333; margin-bottom:2px; }
.rt-apro-rule { border:none; border-top:2px solid #1a1a1a; margin:10px 0 0; }
.rt-apro-rule2 { border:none; border-top:1px solid #1a1a1a; margin:0 0 12px; }
.rt-apro-section { margin-top:12px; }
.rt-apro-stitle { font-size:10.5pt; font-weight:bold; color:#000; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:5px; border-bottom:1px solid #333; padding-bottom:1px; }
.rt-apro-entry { margin-bottom:9px; }
.rt-apro-entry:last-child { margin-bottom:0; }
.rt-apro-eh { display:flex; justify-content:space-between; align-items:baseline; }
.rt-apro-role { font-weight:bold; font-size:10pt; }
.rt-apro-dates { font-size:9.5pt; color:#333; white-space:nowrap; }
.rt-apro-org { font-size:9.5pt; color:#333; }
.rt-apro-bullets { margin:3px 0 0 18px; padding:0; list-style:disc; }
.rt-apro-bullets li { font-size:9.5pt; line-height:1.5; margin-bottom:2px; }
.rt-apro-summary { font-size:10pt; line-height:1.6; }
.rt-apro-skill-row { font-size:9.5pt; margin-bottom:2px; }
.rt-apro-skill-bold { font-weight:bold; }
.rt-apro-langs { font-size:9.5pt; }
`

export function ATSProfessionalTemplate({ data }: TemplateProps) {
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
      <div className="rt-apro">
        <div className="rt-apro-name">{data.personalInfo.fullName || 'Your Name'}</div>
        {contacts.map((c, i) => <div key={i} className="rt-apro-contact">{c}</div>)}
        <hr className="rt-apro-rule" />
        <hr className="rt-apro-rule2" />

        {data.summary && (
          <div className="rt-apro-section">
            <div className="rt-apro-stitle">Summary</div>
            <p className="rt-apro-summary">{data.summary}</p>
          </div>
        )}

        {data.workExperience.length > 0 && (
          <div className="rt-apro-section">
            <div className="rt-apro-stitle">Work Experience</div>
            {data.workExperience.map((exp, i) => (
              <div key={i} className="rt-apro-entry">
                <div className="rt-apro-eh">
                  <span className="rt-apro-role">{exp.position || 'Position'}</span>
                  <span className="rt-apro-dates">{dr(exp.startDate, exp.endDate, exp.current)}</span>
                </div>
                <div className="rt-apro-org">{exp.company}{exp.location ? ` | ${exp.location}` : ''}</div>
                {exp.description.filter(Boolean).length > 0 && (
                  <ul className="rt-apro-bullets">
                    {exp.description.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="rt-apro-section">
            <div className="rt-apro-stitle">Education</div>
            {data.education.map((ed, i) => (
              <div key={i} className="rt-apro-entry">
                <div className="rt-apro-eh">
                  <span className="rt-apro-role">{ed.degree}{ed.field ? `, ${ed.field}` : ''}</span>
                  <span className="rt-apro-dates">{ed.startDate}{ed.endDate ? ` – ${ed.endDate}` : ''}</span>
                </div>
                <div className="rt-apro-org">{ed.institution}{ed.gpa ? ` | GPA: ${ed.gpa}` : ''}</div>
              </div>
            ))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="rt-apro-section">
            <div className="rt-apro-stitle">Skills</div>
            {data.skills.map((g, i) => (
              <div key={i} className="rt-apro-skill-row">
                {g.category && <span className="rt-apro-skill-bold">{g.category}: </span>}
                <span>{g.items.join(', ')}</span>
              </div>
            ))}
          </div>
        )}

        {data.certifications.length > 0 && (
          <div className="rt-apro-section">
            <div className="rt-apro-stitle">Certifications</div>
            {data.certifications.map((cert, i) => (
              <div key={i} className="rt-apro-entry">
                <div className="rt-apro-eh">
                  <span className="rt-apro-role">{cert.name}</span>
                  {cert.date && <span className="rt-apro-dates">{cert.date}</span>}
                </div>
                {cert.issuer && <div className="rt-apro-org">{cert.issuer}</div>}
              </div>
            ))}
          </div>
        )}

        {data.languages.length > 0 && (
          <div className="rt-apro-section">
            <div className="rt-apro-stitle">Languages</div>
            <div className="rt-apro-langs">
              {data.languages.map((l) => `${l.language}: ${l.proficiency}`).join('  |  ')}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
