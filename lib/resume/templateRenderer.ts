// Template Renderer
// Renders resume data into HTML based on template structure

import type { ResumeData } from '@/types'
import { getTemplateStyle, templateStyles } from './templateStyles'
import { generateCustomizationCSS, defaultCustomization } from './customization'

export interface TemplateConfig {
  id: string
  name: string
  supportsPhoto: boolean
  styles?: string
  templateKey?: string // Key to identify which template style to use
}

// Render resume data to HTML
export function renderResumeToHTML(
  data: ResumeData,
  template: TemplateConfig
): string {
  // Get template style if templateKey is provided
  const templateStyle = template.templateKey 
    ? getTemplateStyle(template.templateKey) 
    : null
  
  // Use template style's supportsPhoto if available, otherwise use template config
  const supportsPhoto = templateStyle?.supportsPhoto ?? template.supportsPhoto
  
  const photoSection = supportsPhoto && data.personalInfo.photo
    ? `<div class="resume-photo">
         <img src="${data.personalInfo.photo}" alt="Profile Photo" class="photo-img" />
       </div>`
    : ''

  const personalInfo = `
    <div class="resume-header">
      ${photoSection}
      <div class="resume-header-content">
        <h1 class="resume-name">${escapeHtml(data.personalInfo.fullName || 'Your Name')}</h1>
        <div class="resume-contact">
          ${data.personalInfo.email ? `<span>${escapeHtml(data.personalInfo.email)}</span>` : ''}
          ${data.personalInfo.phone ? `<span>${escapeHtml(data.personalInfo.phone)}</span>` : ''}
          ${data.personalInfo.location ? `<span>${escapeHtml(data.personalInfo.location)}</span>` : ''}
          ${data.personalInfo.linkedIn ? `<span><a href="${escapeHtml(data.personalInfo.linkedIn)}">LinkedIn</a></span>` : ''}
          ${data.personalInfo.website ? `<span><a href="${escapeHtml(data.personalInfo.website)}">Website</a></span>` : ''}
        </div>
      </div>
    </div>
  `

  const summary = data.summary
    ? `<div class="resume-section">
         <h2 class="section-title">Professional Summary</h2>
         <p class="section-content">${escapeHtml(data.summary)}</p>
       </div>`
    : ''

  const workExperience = data.workExperience.length > 0
    ? `<div class="resume-section">
         <h2 class="section-title">Work Experience</h2>
         ${data.workExperience.map(exp => `
           <div class="experience-item">
             <div class="experience-header">
               <div style="flex: 1;">
                 <div style="display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;">
                   <h3 class="experience-position">${escapeHtml(exp.position || 'Position')}</h3>
                   <span class="experience-dates">
                     | ${exp.startDate || ''} — ${exp.current ? 'Present' : (exp.endDate || '')}
                   </span>
                 </div>
                 <div class="experience-company-location">
                   ${escapeHtml(exp.company || 'Company')}${exp.location ? ` - ${escapeHtml(exp.location)}` : ''}
                 </div>
               </div>
             </div>
             ${exp.description && exp.description.length > 0
               ? `<ul class="experience-bullets">
                    ${exp.description.map(bullet => `<li>${escapeHtml(bullet)}</li>`).join('')}
                  </ul>`
               : ''
             }
           </div>
         `).join('')}
       </div>`
    : ''

  const education = data.education.length > 0
    ? `<div class="resume-section">
         <h2 class="section-title">Education</h2>
         ${data.education.map(edu => `
           <div class="education-item">
             <div class="education-header">
               <h3 class="education-degree">${escapeHtml(edu.degree || 'Degree')}</h3>
               ${(edu.startDate || edu.endDate) ? `<span class="education-dates">| ${edu.startDate || ''} — ${edu.endDate || ''}</span>` : ''}
             </div>
             <p class="education-institution">${escapeHtml(edu.institution || 'Institution')}</p>
             ${edu.field ? `<p class="education-field">${escapeHtml(edu.field)}</p>` : ''}
             ${edu.gpa ? `<p class="education-gpa">GPA: ${escapeHtml(edu.gpa)}</p>` : ''}
           </div>
         `).join('')}
       </div>`
    : ''

  const skills = data.skills.length > 0
    ? `<div class="resume-section">
         <h2 class="section-title">Skills</h2>
         ${data.skills.map(skillGroup => `
           <div class="skills-group">
             ${skillGroup.category && skillGroup.category !== 'Skills' ? `<h3 class="skills-category">${escapeHtml(skillGroup.category)}</h3>` : ''}
             <ul class="skills-list">
               ${skillGroup.items.map(item => `<li class="skills-item">${escapeHtml(item)}</li>`).join('')}
             </ul>
           </div>
         `).join('')}
       </div>`
    : ''

  const certifications = data.certifications.length > 0
    ? `<div class="resume-section">
         <h2 class="section-title">Certifications</h2>
         ${data.certifications.map(cert => `
           <div class="certification-item">
             <h3 class="certification-name">${escapeHtml(cert.name)}</h3>
             <p class="certification-issuer">${escapeHtml(cert.issuer)}</p>
             <p class="certification-date">${escapeHtml(cert.date)}${cert.expiryDate ? ` - Expires: ${escapeHtml(cert.expiryDate)}` : ''}</p>
           </div>
         `).join('')}
       </div>`
    : ''

  const languages = data.languages.length > 0
    ? `<div class="resume-section">
         <h2 class="section-title">Languages</h2>
         <div class="languages-list">
           ${data.languages.map(lang => `
             <span class="language-item">${escapeHtml(lang.language)} - ${escapeHtml(lang.proficiency)}</span>
           `).join('')}
         </div>
       </div>`
    : ''

  // Get customization or use defaults
  const customization = data.customization 
    ? { ...defaultCustomization, ...data.customization }
    : defaultCustomization

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Resume - ${escapeHtml(data.personalInfo.fullName || 'Resume')}</title>
      <style>
        ${getBaseStyles()}
        ${templateStyle?.getStyles() || template.styles || ''}
        ${generateCustomizationCSS(customization)}
      </style>
    </head>
    <body>
      <div class="resume-container">
        ${personalInfo}
        ${summary}
        ${workExperience}
        ${education}
        ${skills}
        ${certifications}
        ${languages}
      </div>
    </body>
    </html>
  `
}

// Base styles for all templates (PDF-optimized, no media queries)
function getBaseStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      width: 100%;
      height: auto;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #333;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
    }
    
    .resume-container {
      width: 8.5in;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.4in;
      background: #fff;
      min-height: 11in;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      overflow: visible;
      overflow-x: visible;
      overflow-y: visible;
      box-sizing: border-box;
    }
    
    .resume-header {
      display: flex;
      flex-direction: row;
      align-items: center;
      text-align: left;
      margin-bottom: 14px;
      padding-bottom: 12px;
      border-bottom: 2px solid #333;
    }
    
    .resume-photo {
      margin-right: 20px;
      margin-bottom: 0;
      flex-shrink: 0;
    }
    
    .photo-img {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .resume-header-content {
      flex: 1;
      width: auto;
    }
    
    .resume-name {
      font-size: 24pt;
      font-weight: bold;
      margin-bottom: 6px;
      color: #1a1a1a;
      line-height: 1.2;
    }
    
    .resume-contact {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 10pt;
      color: #666;
      align-items: center;
    }
    
    .resume-contact span {
      display: flex;
      align-items: center;
      white-space: nowrap;
    }
    
    .resume-contact a {
      color: #0066cc;
      text-decoration: none;
    }
    
    .resume-section {
      margin-bottom: 12px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    .section-title {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 6px;
      margin-top: 0;
      padding-bottom: 4px;
      border-bottom: 2px solid #667eea;
      color: #667eea;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .section-content {
      text-align: left;
      line-height: 1.5;
      margin-top: 4px;
      margin-bottom: 0;
      padding: 0;
      white-space: normal;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      hyphens: auto;
      font-size: 11pt;
      overflow: visible;
      overflow-x: visible;
      overflow-y: visible;
      max-width: 100%;
      box-sizing: border-box;
    }
    
    .experience-item,
    .education-item,
    .certification-item {
      margin-bottom: 10px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    .experience-header {
      margin-bottom: 6px;
    }
    
    .experience-position {
      font-size: 12pt;
      font-weight: bold;
      color: #667eea;
      text-transform: uppercase;
      display: inline-block;
    }
    
    .experience-dates {
      font-size: 10pt;
      color: #333;
      font-weight: normal;
      margin-left: 8px;
    }
    
    .experience-company-location {
      font-weight: 500;
      color: #333;
      margin-top: 4px;
      font-size: 10.5pt;
      line-height: 1.4;
    }
    
    .experience-bullets {
      margin: 6px 0 6px 0;
      padding-left: 25px;
      list-style-type: disc;
      list-style-position: outside;
    }
    
    .experience-bullets li {
      margin-bottom: 4px;
      line-height: 1.45;
      padding-left: 6px;
      text-align: left;
      display: list-item;
      list-style-type: disc;
      font-size: 11pt;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      hyphens: auto;
      overflow: visible;
      overflow-x: visible;
      overflow-y: visible;
      max-width: 100%;
      box-sizing: border-box;
    }
    
    .experience-bullets li::marker {
      color: #000;
      font-size: 0.9em;
      font-weight: bold;
    }
    
    .education-header {
      display: flex;
      align-items: baseline;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 4px;
    }
    
    .education-degree {
      font-size: 12pt;
      font-weight: bold;
      color: #667eea;
    }
    
    .education-dates {
      font-size: 10pt;
      color: #333;
      font-weight: normal;
    }
    
    .education-institution {
      font-weight: 600;
      color: #333;
      margin-top: 4px;
      font-size: 10.5pt;
    }
    
    .education-field,
    .education-gpa {
      font-size: 10pt;
      color: #666;
      margin-top: 3px;
    }
    
    .skills-group {
      margin-bottom: 6px;
    }
    
    .skills-category {
      font-weight: 600;
      margin-bottom: 4px;
      color: #333;
      font-size: 11pt;
    }
    
    .skills-items {
      color: #333;
    }
    
    .skills-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      column-gap: 24px;
      row-gap: 2px;
      margin: 0 0 0 20px;
      padding-left: 20px;
      list-style-type: disc;
      list-style-position: outside;
    }
    
    .skills-item {
      margin-bottom: 2px;
      line-height: 1.4;
      padding-left: 4px;
      color: #333;
      display: list-item;
      list-style-type: disc;
      font-size: 11pt;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      white-space: normal;
      overflow: visible;
      overflow-x: visible;
      overflow-y: visible;
      max-width: 100%;
      box-sizing: border-box;
    }
    
    .skills-item::marker {
      color: #000;
      font-size: 0.9em;
      font-weight: bold;
    }
    
    .certification-item {
      margin-bottom: 12px;
    }
    
    .certification-name {
      font-size: 11pt;
      font-weight: bold;
      color: #1a1a1a;
    }
    
    .certification-issuer {
      font-size: 10pt;
      color: #666;
      margin-top: 3px;
      font-weight: 500;
    }
    
    .certification-date {
      font-size: 9pt;
      color: #999;
      margin-top: 2px;
    }
    
    .languages-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 8px;
    }
    
    .language-item {
      margin-bottom: 6px;
      font-size: 11pt;
    }
    
    .language-name {
      font-weight: 600;
      color: #333;
    }
    
    .language-proficiency {
      color: #666;
      margin-left: 8px;
    }
    
    /* Page break optimization for PDF */
    @page {
      size: letter;
      margin: 0;
    }
    
    /* Ensure colors print correctly in PDF */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
  `
}

function escapeHtml(text: string): string {
  if (!text) return ''
  // Server-side safe HTML escaping
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

