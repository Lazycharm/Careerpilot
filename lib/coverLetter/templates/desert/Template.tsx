import type { CLTemplateProps } from '../types'
import { parseCoverLetterContent } from '../shared'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Inter:wght@400;500&display=swap');`

const CSS = `
.cl-d { font-family:'Inter','Helvetica Neue',Arial,sans-serif; font-size:10pt; line-height:1.65; color:#292524; background:#fff; width:210mm; min-height:297mm; padding:20mm 18mm; box-sizing:border-box; }
.cl-d-header { text-align:center; padding-bottom:16px; border-bottom:1.5px solid #d4a24e; margin-bottom:18px; }
.cl-d-name { font-family:'Merriweather',Georgia,serif; font-size:22pt; font-weight:700; color:#1c1007; margin-bottom:5px; }
.cl-d-contact { font-size:8.5pt; color:#78716c; display:flex; flex-wrap:wrap; justify-content:center; gap:0; }
.cl-d-ci+.cl-d-ci::before { content:"  ·  "; color:#d4a24e; }
.cl-d-date { font-size:9pt; color:#78716c; margin-bottom:16px; }
.cl-d-recipient { margin-bottom:18px; }
.cl-d-company { font-weight:600; font-size:10pt; color:#1c1007; }
.cl-d-addr { font-size:9pt; color:#57534e; }
.cl-d-salutation { font-family:'Merriweather',Georgia,serif; font-size:10.5pt; color:#1c1007; margin-bottom:14px; }
.cl-d-para { font-size:10pt; margin-bottom:12px; color:#44403c; text-align:justify; }
.cl-d-footer { margin-top:28px; border-top:1px solid #e7d5b3; padding-top:14px; }
.cl-d-closing { font-size:10pt; color:#44403c; }
.cl-d-sig { font-family:'Merriweather',Georgia,serif; font-size:11pt; font-weight:700; color:#1c1007; margin-top:16px; }
`

export function DesertCLTemplate({ data }: CLTemplateProps) {
  const { paragraphs, closing, signature } = parseCoverLetterContent(data.content)
  const contacts = [data.candidateEmail, data.candidatePhone, data.candidateLocation].filter(Boolean)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONTS + CSS }} />
      <div className="cl-d">
        <div className="cl-d-header">
          <div className="cl-d-name">{data.candidateName || 'Your Name'}</div>
          <div className="cl-d-contact">
            {contacts.map((c, i) => <span key={i} className="cl-d-ci">{c}</span>)}
          </div>
        </div>
        {data.date && <div className="cl-d-date">{data.date}</div>}
        {(data.companyName || data.recipientName) && (
          <div className="cl-d-recipient">
            {data.recipientName && <div className="cl-d-company">{data.recipientName}{data.recipientTitle ? `, ${data.recipientTitle}` : ''}</div>}
            {data.companyName && <div className="cl-d-company">{data.companyName}</div>}
            {data.companyAddress && <div className="cl-d-addr">{data.companyAddress}</div>}
          </div>
        )}
        <div className="cl-d-salutation">Dear {data.recipientName || 'Hiring Manager'},</div>
        {paragraphs.map((p, i) => <p key={i} className="cl-d-para">{p}</p>)}
        <div className="cl-d-footer">
          <div className="cl-d-closing">{closing}</div>
          <div className="cl-d-sig">{signature || data.candidateName || ''}</div>
        </div>
      </div>
    </>
  )
}
