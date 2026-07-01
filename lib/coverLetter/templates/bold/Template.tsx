import type { CLTemplateProps } from '../types'
import { parseCoverLetterContent } from '../shared'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`

const CSS = `
.cl-b { font-family:'Poppins','Helvetica Neue',Arial,sans-serif; font-size:10pt; line-height:1.65; color:#1f2937; background:#fff; width:210mm; min-height:297mm; padding:0; box-sizing:border-box; }
.cl-b-header { padding:16mm 18mm 12mm; }
.cl-b-name { font-size:28pt; font-weight:800; color:#111827; line-height:1; margin-bottom:6px; letter-spacing:-0.5px; }
.cl-b-contact { font-size:8.5pt; color:#6b7280; display:flex; flex-wrap:wrap; gap:0; }
.cl-b-ci+.cl-b-ci::before { content:" · "; color:#d1d5db; }
.cl-b-accent { height:5px; background:#ea580c; }
.cl-b-body { padding:14mm 18mm; }
.cl-b-date { font-size:9pt; color:#9ca3af; margin-bottom:16px; }
.cl-b-recipient { margin-bottom:18px; }
.cl-b-company { font-weight:700; font-size:10.5pt; color:#111827; }
.cl-b-addr { font-size:9pt; color:#6b7280; }
.cl-b-salutation { font-size:11pt; font-weight:700; color:#ea580c; margin-bottom:14px; }
.cl-b-para { font-size:10pt; margin-bottom:12px; color:#374151; }
.cl-b-footer { margin-top:28px; border-top:2px solid #fed7aa; padding-top:12px; }
.cl-b-closing { font-size:10pt; color:#374151; }
.cl-b-sig { font-size:12pt; font-weight:800; color:#111827; margin-top:14px; }
`

export function BoldCLTemplate({ data }: CLTemplateProps) {
  const { paragraphs, closing, signature } = parseCoverLetterContent(data.content)
  const contacts = [data.candidateEmail, data.candidatePhone, data.candidateLocation].filter(Boolean)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONTS + CSS }} />
      <div className="cl-b">
        <div className="cl-b-header">
          <div className="cl-b-name">{data.candidateName || 'Your Name'}</div>
          <div className="cl-b-contact">
            {contacts.map((c, i) => <span key={i} className="cl-b-ci">{c}</span>)}
          </div>
        </div>
        <div className="cl-b-accent" />
        <div className="cl-b-body">
          {data.date && <div className="cl-b-date">{data.date}</div>}
          {(data.companyName || data.recipientName) && (
            <div className="cl-b-recipient">
              {data.recipientName && <div className="cl-b-company">{data.recipientName}{data.recipientTitle ? `, ${data.recipientTitle}` : ''}</div>}
              {data.companyName && <div className="cl-b-company">{data.companyName}</div>}
              {data.companyAddress && <div className="cl-b-addr">{data.companyAddress}</div>}
            </div>
          )}
          <div className="cl-b-salutation">Dear {data.recipientName || 'Hiring Manager'},</div>
          {paragraphs.map((p, i) => <p key={i} className="cl-b-para">{p}</p>)}
          <div className="cl-b-footer">
            <div className="cl-b-closing">{closing}</div>
            <div className="cl-b-sig">{signature || data.candidateName || ''}</div>
          </div>
        </div>
      </div>
    </>
  )
}
