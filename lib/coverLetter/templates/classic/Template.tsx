import type { CLTemplateProps } from '../types'
import { parseCoverLetterContent } from '../shared'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');`

const CSS = `
.cl-c { font-family:'Inter','Helvetica Neue',Arial,sans-serif; font-size:10pt; line-height:1.65; color:#1f2937; background:#fff; width:210mm; min-height:297mm; padding:20mm 18mm; box-sizing:border-box; }
.cl-c-header { border-bottom:2px solid #1d4ed8; padding-bottom:12px; margin-bottom:20px; }
.cl-c-name { font-size:22pt; font-weight:700; color:#0f172a; letter-spacing:-0.3px; margin-bottom:4px; }
.cl-c-contact { display:flex; flex-wrap:wrap; gap:0; font-size:8.5pt; color:#6b7280; }
.cl-c-ci+.cl-c-ci::before { content:" · "; color:#9ca3af; }
.cl-c-date { font-size:9pt; color:#6b7280; margin-top:6px; }
.cl-c-recipient { margin-bottom:18px; }
.cl-c-company { font-weight:600; font-size:10pt; color:#0f172a; }
.cl-c-addr { font-size:9pt; color:#4b5563; }
.cl-c-salutation { font-size:10pt; font-weight:500; color:#0f172a; margin-bottom:14px; }
.cl-c-para { font-size:10pt; margin-bottom:12px; color:#374151; }
.cl-c-footer { margin-top:24px; }
.cl-c-closing { font-size:10pt; color:#374151; }
.cl-c-sig { font-size:11pt; font-weight:600; color:#0f172a; margin-top:18px; }
`

export function ClassicCLTemplate({ data }: CLTemplateProps) {
  const { paragraphs, closing, signature } = parseCoverLetterContent(data.content)
  const contacts = [data.candidateEmail, data.candidatePhone, data.candidateLocation].filter(Boolean)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONTS + CSS }} />
      <div className="cl-c">
        <div className="cl-c-header">
          <div className="cl-c-name">{data.candidateName || 'Your Name'}</div>
          <div className="cl-c-contact">
            {contacts.map((c, i) => <span key={i} className="cl-c-ci">{c}</span>)}
          </div>
          {data.date && <div className="cl-c-date">{data.date}</div>}
        </div>
        {(data.companyName || data.recipientName) && (
          <div className="cl-c-recipient">
            {data.recipientName && <div className="cl-c-company">{data.recipientName}{data.recipientTitle ? `, ${data.recipientTitle}` : ''}</div>}
            {data.companyName && <div className="cl-c-company">{data.companyName}</div>}
            {data.companyAddress && <div className="cl-c-addr">{data.companyAddress}</div>}
          </div>
        )}
        <div className="cl-c-salutation">Dear {data.recipientName ? data.recipientName : 'Hiring Manager'},</div>
        {paragraphs.map((p, i) => <p key={i} className="cl-c-para">{p}</p>)}
        <div className="cl-c-footer">
          <div className="cl-c-closing">{closing}</div>
          <div className="cl-c-sig">{signature || data.candidateName || ''}</div>
        </div>
      </div>
    </>
  )
}
