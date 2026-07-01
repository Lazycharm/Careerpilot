import type { CLTemplateProps } from '../types'
import { parseCoverLetterContent } from '../shared'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Inter:wght@400;500;600&display=swap');`

const CSS = `
.cl-e { font-family:'Inter','Helvetica Neue',Arial,sans-serif; font-size:10pt; line-height:1.65; color:#1f2937; background:#fff; width:210mm; min-height:297mm; padding:18mm 18mm; box-sizing:border-box; }
.cl-e-header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #7c2d12; padding-bottom:14px; margin-bottom:18px; }
.cl-e-hl { }
.cl-e-name { font-family:'Merriweather',Georgia,serif; font-size:20pt; font-weight:700; color:#1c0d04; letter-spacing:-0.2px; margin-bottom:3px; }
.cl-e-title { font-size:9.5pt; color:#7c2d12; font-weight:500; letter-spacing:0.5px; }
.cl-e-hr { }
.cl-e-contact { text-align:right; font-size:8.5pt; color:#6b7280; line-height:1.8; }
.cl-e-date { font-size:9pt; color:#6b7280; margin-bottom:16px; }
.cl-e-recipient { margin-bottom:18px; }
.cl-e-company { font-weight:600; font-size:10pt; color:#0f172a; }
.cl-e-addr { font-size:9pt; color:#4b5563; }
.cl-e-salutation { font-family:'Merriweather',Georgia,serif; font-size:10.5pt; color:#1c0d04; margin-bottom:14px; }
.cl-e-para { font-size:10pt; margin-bottom:12px; color:#374151; text-align:justify; }
.cl-e-footer { margin-top:28px; border-top:1px solid #fee2e2; padding-top:14px; }
.cl-e-closing { font-size:10pt; color:#374151; }
.cl-e-sig { font-family:'Merriweather',Georgia,serif; font-size:11pt; font-weight:700; color:#1c0d04; margin-top:18px; }
`

export function ExecutiveCLTemplate({ data }: CLTemplateProps) {
  const { paragraphs, closing, signature } = parseCoverLetterContent(data.content)
  const contacts = [data.candidateEmail, data.candidatePhone, data.candidateLocation].filter(Boolean)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONTS + CSS }} />
      <div className="cl-e">
        <div className="cl-e-header">
          <div className="cl-e-hl">
            <div className="cl-e-name">{data.candidateName || 'Your Name'}</div>
            {data.jobTitle && <div className="cl-e-title">{data.jobTitle}</div>}
          </div>
          <div className="cl-e-contact">
            {contacts.map((c, i) => <div key={i}>{c}</div>)}
          </div>
        </div>
        {data.date && <div className="cl-e-date">{data.date}</div>}
        {(data.companyName || data.recipientName) && (
          <div className="cl-e-recipient">
            {data.recipientName && <div className="cl-e-company">{data.recipientName}{data.recipientTitle ? `, ${data.recipientTitle}` : ''}</div>}
            {data.companyName && <div className="cl-e-company">{data.companyName}</div>}
            {data.companyAddress && <div className="cl-e-addr">{data.companyAddress}</div>}
          </div>
        )}
        <div className="cl-e-salutation">Dear {data.recipientName || 'Hiring Manager'},</div>
        {paragraphs.map((p, i) => <p key={i} className="cl-e-para">{p}</p>)}
        <div className="cl-e-footer">
          <div className="cl-e-closing">{closing}</div>
          <div className="cl-e-sig">{signature || data.candidateName || ''}</div>
        </div>
      </div>
    </>
  )
}
