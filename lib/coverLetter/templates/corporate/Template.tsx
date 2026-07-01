import type { CLTemplateProps } from '../types'
import { parseCoverLetterContent } from '../shared'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`

const CSS = `
.cl-co { font-family:'Inter','Helvetica Neue',Arial,sans-serif; font-size:10pt; line-height:1.65; color:#1f2937; background:#fff; width:210mm; min-height:297mm; padding:20mm 20mm; box-sizing:border-box; }
.cl-co-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
.cl-co-name { font-size:20pt; font-weight:700; color:#111827; }
.cl-co-contact { text-align:right; font-size:8.5pt; color:#6b7280; line-height:1.9; }
.cl-co-rule1 { border:none; border-top:3px solid #374151; margin:0 0 2px 0; }
.cl-co-rule2 { border:none; border-top:1px solid #e5e7eb; margin:0 0 18px 0; }
.cl-co-date { font-size:9pt; color:#6b7280; margin-bottom:16px; }
.cl-co-recipient { margin-bottom:18px; }
.cl-co-company { font-weight:600; font-size:10pt; color:#111827; }
.cl-co-addr { font-size:9pt; color:#4b5563; }
.cl-co-salutation { font-size:10.5pt; font-weight:500; color:#111827; margin-bottom:14px; }
.cl-co-para { font-size:10pt; margin-bottom:12px; color:#374151; text-align:justify; }
.cl-co-footer { margin-top:28px; }
.cl-co-closing { font-size:10pt; color:#374151; }
.cl-co-sig { font-size:11pt; font-weight:700; color:#111827; margin-top:18px; border-top:1px solid #e5e7eb; padding-top:14px; }
`

export function CorporateCLTemplate({ data }: CLTemplateProps) {
  const { paragraphs, closing, signature } = parseCoverLetterContent(data.content)
  const contacts = [data.candidateEmail, data.candidatePhone, data.candidateLocation].filter(Boolean)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONTS + CSS }} />
      <div className="cl-co">
        <div className="cl-co-top">
          <div className="cl-co-name">{data.candidateName || 'Your Name'}</div>
          <div className="cl-co-contact">
            {contacts.map((c, i) => <div key={i}>{c}</div>)}
          </div>
        </div>
        <hr className="cl-co-rule1" />
        <hr className="cl-co-rule2" />
        {data.date && <div className="cl-co-date">{data.date}</div>}
        {(data.companyName || data.recipientName) && (
          <div className="cl-co-recipient">
            {data.recipientName && <div className="cl-co-company">{data.recipientName}{data.recipientTitle ? `, ${data.recipientTitle}` : ''}</div>}
            {data.companyName && <div className="cl-co-company">{data.companyName}</div>}
            {data.companyAddress && <div className="cl-co-addr">{data.companyAddress}</div>}
          </div>
        )}
        <div className="cl-co-salutation">Dear {data.recipientName || 'Hiring Manager'},</div>
        {paragraphs.map((p, i) => <p key={i} className="cl-co-para">{p}</p>)}
        <div className="cl-co-footer">
          <div className="cl-co-closing">{closing}</div>
          <div className="cl-co-sig">{signature || data.candidateName || ''}</div>
        </div>
      </div>
    </>
  )
}
