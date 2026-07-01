import type { CLTemplateProps } from '../types'
import { parseCoverLetterContent } from '../shared'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');`

const CSS = `
.cl-mo { font-family:'Poppins','Helvetica Neue',Arial,sans-serif; font-size:10pt; line-height:1.65; color:#1f2937; background:#fff; width:210mm; min-height:297mm; padding:0; box-sizing:border-box; display:flex; }
.cl-mo-sidebar { width:58mm; background:#0d9488; padding:18mm 8mm 18mm 8mm; flex-shrink:0; }
.cl-mo-sname { font-size:15pt; font-weight:700; color:#fff; line-height:1.2; margin-bottom:6px; }
.cl-mo-sjob { font-size:8.5pt; color:#99f6e4; font-weight:500; margin-bottom:18px; }
.cl-mo-scontact { font-size:8pt; color:#ccfbf1; line-height:1.9; }
.cl-mo-slabel { font-size:7pt; text-transform:uppercase; letter-spacing:1.5px; color:#5eead4; font-weight:600; margin-top:14px; margin-bottom:2px; }
.cl-mo-main { flex:1; padding:18mm 14mm; }
.cl-mo-date { font-size:9pt; color:#9ca3af; margin-bottom:16px; }
.cl-mo-recipient { margin-bottom:18px; }
.cl-mo-company { font-weight:600; font-size:10pt; color:#0f172a; }
.cl-mo-addr { font-size:9pt; color:#6b7280; }
.cl-mo-salutation { font-size:10.5pt; font-weight:600; color:#0d9488; margin-bottom:16px; }
.cl-mo-para { font-size:9.5pt; margin-bottom:12px; color:#374151; line-height:1.7; }
.cl-mo-footer { margin-top:28px; border-top:1px solid #f0fdfa; padding-top:14px; }
.cl-mo-closing { font-size:10pt; color:#374151; }
.cl-mo-sig { font-size:11pt; font-weight:700; color:#0d9488; margin-top:16px; }
`

export function ModernCLTemplate({ data }: CLTemplateProps) {
  const { paragraphs, closing, signature } = parseCoverLetterContent(data.content)
  const contacts = [data.candidateEmail, data.candidatePhone, data.candidateLocation].filter(Boolean)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONTS + CSS }} />
      <div className="cl-mo">
        <div className="cl-mo-sidebar">
          <div className="cl-mo-sname">{data.candidateName || 'Your Name'}</div>
          {data.jobTitle && <div className="cl-mo-sjob">{data.jobTitle}</div>}
          <div className="cl-mo-slabel">Contact</div>
          <div className="cl-mo-scontact">
            {contacts.map((c, i) => <div key={i}>{c}</div>)}
          </div>
        </div>
        <div className="cl-mo-main">
          {data.date && <div className="cl-mo-date">{data.date}</div>}
          {(data.companyName || data.recipientName) && (
            <div className="cl-mo-recipient">
              {data.recipientName && <div className="cl-mo-company">{data.recipientName}{data.recipientTitle ? `, ${data.recipientTitle}` : ''}</div>}
              {data.companyName && <div className="cl-mo-company">{data.companyName}</div>}
              {data.companyAddress && <div className="cl-mo-addr">{data.companyAddress}</div>}
            </div>
          )}
          <div className="cl-mo-salutation">Dear {data.recipientName || 'Hiring Manager'},</div>
          {paragraphs.map((p, i) => <p key={i} className="cl-mo-para">{p}</p>)}
          <div className="cl-mo-footer">
            <div className="cl-mo-closing">{closing}</div>
            <div className="cl-mo-sig">{signature || data.candidateName || ''}</div>
          </div>
        </div>
      </div>
    </>
  )
}
