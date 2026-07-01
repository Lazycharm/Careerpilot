import type { CLTemplateProps } from '../types'
import { parseCoverLetterContent } from '../shared'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`

const CSS = `
.cl-h { font-family:'Inter','Helvetica Neue',Arial,sans-serif; font-size:10pt; line-height:1.65; color:#1f2937; background:#fff; width:210mm; min-height:297mm; padding:20mm 18mm; box-sizing:border-box; }
.cl-h-header { border-left:4px solid #059669; padding-left:14px; margin-bottom:18px; }
.cl-h-name { font-size:21pt; font-weight:700; color:#064e3b; margin-bottom:4px; }
.cl-h-contact { font-size:8.5pt; color:#6b7280; }
.cl-h-ci+.cl-h-ci::before { content:" · "; }
.cl-h-rule { border:none; border-top:1.5px solid #d1fae5; margin:14px 0 18px 0; }
.cl-h-date { font-size:9pt; color:#9ca3af; margin-bottom:16px; }
.cl-h-recipient { margin-bottom:18px; background:#f0fdf4; border-radius:6px; padding:10px 14px; }
.cl-h-company { font-weight:600; font-size:10pt; color:#064e3b; }
.cl-h-addr { font-size:9pt; color:#4b5563; }
.cl-h-salutation { font-size:10.5pt; font-weight:500; color:#064e3b; margin-bottom:14px; }
.cl-h-para { font-size:10pt; margin-bottom:12px; color:#374151; }
.cl-h-footer { margin-top:28px; border-top:1.5px solid #d1fae5; padding-top:14px; }
.cl-h-closing { font-size:10pt; color:#374151; }
.cl-h-sig { font-size:11pt; font-weight:700; color:#059669; margin-top:16px; }
`

export function HealthcareCLTemplate({ data }: CLTemplateProps) {
  const { paragraphs, closing, signature } = parseCoverLetterContent(data.content)
  const contacts = [data.candidateEmail, data.candidatePhone, data.candidateLocation].filter(Boolean)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONTS + CSS }} />
      <div className="cl-h">
        <div className="cl-h-header">
          <div className="cl-h-name">{data.candidateName || 'Your Name'}</div>
          <div className="cl-h-contact">
            {contacts.map((c, i) => <span key={i} className="cl-h-ci">{c}</span>)}
          </div>
        </div>
        <hr className="cl-h-rule" />
        {data.date && <div className="cl-h-date">{data.date}</div>}
        {(data.companyName || data.recipientName) && (
          <div className="cl-h-recipient">
            {data.recipientName && <div className="cl-h-company">{data.recipientName}{data.recipientTitle ? `, ${data.recipientTitle}` : ''}</div>}
            {data.companyName && <div className="cl-h-company">{data.companyName}</div>}
            {data.companyAddress && <div className="cl-h-addr">{data.companyAddress}</div>}
          </div>
        )}
        <div className="cl-h-salutation">Dear {data.recipientName || 'Hiring Manager'},</div>
        {paragraphs.map((p, i) => <p key={i} className="cl-h-para">{p}</p>)}
        <div className="cl-h-footer">
          <div className="cl-h-closing">{closing}</div>
          <div className="cl-h-sig">{signature || data.candidateName || ''}</div>
        </div>
      </div>
    </>
  )
}
