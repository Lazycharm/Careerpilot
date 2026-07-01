import type { CLTemplateProps } from '../types'
import { parseCoverLetterContent } from '../shared'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');`

const CSS = `
.cl-cr { font-family:'Poppins','Helvetica Neue',Arial,sans-serif; font-size:10pt; line-height:1.65; color:#1f2937; background:#fff; width:210mm; min-height:297mm; padding:20mm 18mm; box-sizing:border-box; }
.cl-cr-header { background:linear-gradient(135deg,#7c3aed 0%,#a855f7 100%); border-radius:12px; padding:14px 18px; margin-bottom:20px; }
.cl-cr-name { font-size:20pt; font-weight:700; color:#fff; margin-bottom:4px; }
.cl-cr-contact { font-size:8.5pt; color:#e9d5ff; display:flex; flex-wrap:wrap; gap:0; }
.cl-cr-ci+.cl-cr-ci::before { content:" · "; color:#c4b5fd; }
.cl-cr-date { font-size:9pt; color:#9ca3af; margin-bottom:16px; }
.cl-cr-recipient { margin-bottom:18px; border-left:3px solid #7c3aed; padding-left:10px; }
.cl-cr-company { font-weight:600; font-size:10pt; color:#111827; }
.cl-cr-addr { font-size:9pt; color:#6b7280; }
.cl-cr-salutation { font-size:10.5pt; font-weight:600; color:#7c3aed; margin-bottom:14px; }
.cl-cr-para { font-size:10pt; margin-bottom:12px; color:#374151; }
.cl-cr-footer { margin-top:28px; }
.cl-cr-closing { font-size:10pt; color:#374151; }
.cl-cr-sig { font-size:11pt; font-weight:700; color:#7c3aed; margin-top:16px; }
`

export function CreativeCLTemplate({ data }: CLTemplateProps) {
  const { paragraphs, closing, signature } = parseCoverLetterContent(data.content)
  const contacts = [data.candidateEmail, data.candidatePhone, data.candidateLocation].filter(Boolean)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONTS + CSS }} />
      <div className="cl-cr">
        <div className="cl-cr-header">
          <div className="cl-cr-name">{data.candidateName || 'Your Name'}</div>
          <div className="cl-cr-contact">
            {contacts.map((c, i) => <span key={i} className="cl-cr-ci">{c}</span>)}
          </div>
        </div>
        {data.date && <div className="cl-cr-date">{data.date}</div>}
        {(data.companyName || data.recipientName) && (
          <div className="cl-cr-recipient">
            {data.recipientName && <div className="cl-cr-company">{data.recipientName}{data.recipientTitle ? `, ${data.recipientTitle}` : ''}</div>}
            {data.companyName && <div className="cl-cr-company">{data.companyName}</div>}
            {data.companyAddress && <div className="cl-cr-addr">{data.companyAddress}</div>}
          </div>
        )}
        <div className="cl-cr-salutation">Dear {data.recipientName || 'Hiring Manager'},</div>
        {paragraphs.map((p, i) => <p key={i} className="cl-cr-para">{p}</p>)}
        <div className="cl-cr-footer">
          <div className="cl-cr-closing">{closing}</div>
          <div className="cl-cr-sig">{signature || data.candidateName || ''}</div>
        </div>
      </div>
    </>
  )
}
