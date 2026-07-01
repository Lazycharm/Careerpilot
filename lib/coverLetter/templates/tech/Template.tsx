import type { CLTemplateProps } from '../types'
import { parseCoverLetterContent } from '../shared'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`

const CSS = `
.cl-t { font-family:'Inter','Helvetica Neue',Arial,sans-serif; font-size:10pt; line-height:1.65; color:#1f2937; background:#fff; width:210mm; min-height:297mm; padding:20mm 18mm; box-sizing:border-box; }
.cl-t-header { display:flex; align-items:center; gap:14px; margin-bottom:18px; }
.cl-t-initials { width:44px; height:44px; border-radius:10px; background:#2563eb; color:#fff; font-size:16pt; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.cl-t-hl { }
.cl-t-name { font-size:16pt; font-weight:700; color:#111827; line-height:1.1; }
.cl-t-contact { font-size:8.5pt; color:#6b7280; margin-top:2px; }
.cl-t-rule { border:none; border-top:2px solid #2563eb; margin:0 0 18px 0; }
.cl-t-date { font-size:9pt; color:#9ca3af; margin-bottom:14px; }
.cl-t-recipient { margin-bottom:18px; }
.cl-t-company { font-weight:600; font-size:10pt; color:#111827; }
.cl-t-addr { font-size:9pt; color:#6b7280; }
.cl-t-salutation { font-size:10.5pt; font-weight:600; color:#2563eb; margin-bottom:14px; }
.cl-t-para { font-size:10pt; margin-bottom:12px; color:#374151; }
.cl-t-footer { margin-top:28px; padding-top:14px; border-top:1px solid #e5e7eb; }
.cl-t-closing { font-size:10pt; color:#374151; }
.cl-t-sig { font-size:11pt; font-weight:700; color:#111827; margin-top:16px; }
`

export function TechCLTemplate({ data }: CLTemplateProps) {
  const { paragraphs, closing, signature } = parseCoverLetterContent(data.content)
  const contacts = [data.candidateEmail, data.candidatePhone, data.candidateLocation].filter(Boolean)
  const initials = (data.candidateName || 'YN').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONTS + CSS }} />
      <div className="cl-t">
        <div className="cl-t-header">
          <div className="cl-t-initials">{initials}</div>
          <div className="cl-t-hl">
            <div className="cl-t-name">{data.candidateName || 'Your Name'}</div>
            <div className="cl-t-contact">{contacts.join('  ·  ')}</div>
          </div>
        </div>
        <hr className="cl-t-rule" />
        {data.date && <div className="cl-t-date">{data.date}</div>}
        {(data.companyName || data.recipientName) && (
          <div className="cl-t-recipient">
            {data.recipientName && <div className="cl-t-company">{data.recipientName}{data.recipientTitle ? `, ${data.recipientTitle}` : ''}</div>}
            {data.companyName && <div className="cl-t-company">{data.companyName}</div>}
            {data.companyAddress && <div className="cl-t-addr">{data.companyAddress}</div>}
          </div>
        )}
        <div className="cl-t-salutation">Dear {data.recipientName || 'Hiring Manager'},</div>
        {paragraphs.map((p, i) => <p key={i} className="cl-t-para">{p}</p>)}
        <div className="cl-t-footer">
          <div className="cl-t-closing">{closing}</div>
          <div className="cl-t-sig">{signature || data.candidateName || ''}</div>
        </div>
      </div>
    </>
  )
}
