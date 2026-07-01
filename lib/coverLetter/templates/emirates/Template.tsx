import type { CLTemplateProps } from '../types'
import { parseCoverLetterContent } from '../shared'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`

const CSS = `
.cl-em { font-family:'Inter','Helvetica Neue',Arial,sans-serif; font-size:10pt; line-height:1.65; color:#1f2937; background:#fff; width:210mm; min-height:297mm; padding:0; box-sizing:border-box; }
.cl-em-header { background:#0f172a; padding:14mm 18mm; color:#fff; }
.cl-em-name { font-size:21pt; font-weight:700; color:#fff; letter-spacing:-0.2px; margin-bottom:5px; }
.cl-em-contact { display:flex; flex-wrap:wrap; gap:0; font-size:8.5pt; color:#94a3b8; }
.cl-em-ci+.cl-em-ci::before { content:" · "; color:#475569; }
.cl-em-accent { height:3px; background:linear-gradient(to right,#3b82f6,#8b5cf6); }
.cl-em-body { padding:16mm 18mm; }
.cl-em-date { font-size:9pt; color:#9ca3af; margin-bottom:16px; }
.cl-em-recipient { margin-bottom:18px; }
.cl-em-company { font-weight:600; font-size:10pt; color:#0f172a; }
.cl-em-addr { font-size:9pt; color:#4b5563; }
.cl-em-salutation { font-size:10.5pt; font-weight:600; color:#0f172a; margin-bottom:14px; }
.cl-em-para { font-size:10pt; margin-bottom:12px; color:#374151; }
.cl-em-footer { margin-top:28px; }
.cl-em-closing { font-size:10pt; color:#374151; }
.cl-em-sig { font-size:11pt; font-weight:700; color:#0f172a; margin-top:16px; }
`

export function EmiratesCLTemplate({ data }: CLTemplateProps) {
  const { paragraphs, closing, signature } = parseCoverLetterContent(data.content)
  const contacts = [data.candidateEmail, data.candidatePhone, data.candidateLocation].filter(Boolean)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONTS + CSS }} />
      <div className="cl-em">
        <div className="cl-em-header">
          <div className="cl-em-name">{data.candidateName || 'Your Name'}</div>
          <div className="cl-em-contact">
            {contacts.map((c, i) => <span key={i} className="cl-em-ci">{c}</span>)}
          </div>
        </div>
        <div className="cl-em-accent" />
        <div className="cl-em-body">
          {data.date && <div className="cl-em-date">{data.date}</div>}
          {(data.companyName || data.recipientName) && (
            <div className="cl-em-recipient">
              {data.recipientName && <div className="cl-em-company">{data.recipientName}{data.recipientTitle ? `, ${data.recipientTitle}` : ''}</div>}
              {data.companyName && <div className="cl-em-company">{data.companyName}</div>}
              {data.companyAddress && <div className="cl-em-addr">{data.companyAddress}</div>}
            </div>
          )}
          <div className="cl-em-salutation">Dear {data.recipientName || 'Hiring Manager'},</div>
          {paragraphs.map((p, i) => <p key={i} className="cl-em-para">{p}</p>)}
          <div className="cl-em-footer">
            <div className="cl-em-closing">{closing}</div>
            <div className="cl-em-sig">{signature || data.candidateName || ''}</div>
          </div>
        </div>
      </div>
    </>
  )
}
