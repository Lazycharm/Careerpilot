import type { CLTemplateProps } from '../types'
import { parseCoverLetterContent } from '../shared'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');`

const CSS = `
.cl-m { font-family:'Inter','Helvetica Neue',Arial,sans-serif; font-size:10pt; line-height:1.7; color:#111827; background:#fff; width:210mm; min-height:297mm; padding:22mm 20mm; box-sizing:border-box; }
.cl-m-name { font-size:18pt; font-weight:300; letter-spacing:3px; text-transform:uppercase; color:#0a0a0a; margin-bottom:8px; }
.cl-m-contact { font-size:8.5pt; color:#9ca3af; font-weight:300; letter-spacing:0.5px; margin-bottom:4px; }
.cl-m-rule { border:none; border-top:1px solid #e5e7eb; margin:14px 0; }
.cl-m-date { font-size:9pt; color:#9ca3af; font-weight:300; margin-bottom:18px; }
.cl-m-recipient { margin-bottom:20px; }
.cl-m-company { font-size:9.5pt; font-weight:500; color:#111827; }
.cl-m-addr { font-size:9pt; color:#6b7280; font-weight:300; }
.cl-m-salutation { font-size:10pt; color:#111827; margin-bottom:16px; }
.cl-m-para { font-size:10pt; color:#374151; margin-bottom:14px; font-weight:300; line-height:1.75; }
.cl-m-footer { margin-top:28px; }
.cl-m-closing { font-size:10pt; font-weight:300; color:#374151; }
.cl-m-sig { font-size:10pt; font-weight:500; color:#0a0a0a; margin-top:18px; letter-spacing:0.5px; }
`

export function MinimalCLTemplate({ data }: CLTemplateProps) {
  const { paragraphs, closing, signature } = parseCoverLetterContent(data.content)
  const contacts = [data.candidateEmail, data.candidatePhone, data.candidateLocation].filter(Boolean)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONTS + CSS }} />
      <div className="cl-m">
        <div className="cl-m-name">{data.candidateName || 'Your Name'}</div>
        <div className="cl-m-contact">{contacts.join('  ·  ')}</div>
        <hr className="cl-m-rule" />
        {data.date && <div className="cl-m-date">{data.date}</div>}
        {(data.companyName || data.recipientName) && (
          <div className="cl-m-recipient">
            {data.recipientName && <div className="cl-m-company">{data.recipientName}{data.recipientTitle ? `, ${data.recipientTitle}` : ''}</div>}
            {data.companyName && <div className="cl-m-company">{data.companyName}</div>}
            {data.companyAddress && <div className="cl-m-addr">{data.companyAddress}</div>}
          </div>
        )}
        <div className="cl-m-salutation">Dear {data.recipientName || 'Hiring Manager'},</div>
        {paragraphs.map((p, i) => <p key={i} className="cl-m-para">{p}</p>)}
        <div className="cl-m-footer">
          <div className="cl-m-closing">{closing}</div>
          <div className="cl-m-sig">{signature || data.candidateName || ''}</div>
        </div>
      </div>
    </>
  )
}
