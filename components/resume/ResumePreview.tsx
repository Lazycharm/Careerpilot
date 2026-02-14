'use client'

import { useEffect, useRef } from 'react'
import type { ResumeData } from '@/types'
import { getTemplateStyle } from '@/lib/resume/templateStyles'
import { generateCustomizationCSS, defaultCustomization } from '@/lib/resume/customization'

interface ResumePreviewProps {
  data: ResumeData
  templateKey?: string | null
  supportsPhoto?: boolean
}

export function ResumePreview({ data, templateKey, supportsPhoto = false }: ResumePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!previewRef.current || !templateKey) return

    const templateStyle = getTemplateStyle(templateKey)
    if (!templateStyle) return

    // Apply template styles to the preview
    const styleElement = document.createElement('style')
    styleElement.id = 'template-styles'
    
    // Remove existing template styles
    const existing = document.getElementById('template-styles')
    if (existing) existing.remove()

    // Add base styles + template styles
    styleElement.textContent = `
      ${getBaseStyles()}
      ${templateStyle.getStyles()}
      
      /* Override for preview container */
      .resume-preview-container {
        max-width: 8.5in;
        margin: 0 auto;
        padding: 0.25in;
        background: #fff;
      }
      
      @media (min-width: 640px) {
        .resume-preview-container {
          padding: 0.5in;
        }
      }
    `
    
    document.head.appendChild(styleElement)

    return () => {
      const style = document.getElementById('template-styles')
      if (style) style.remove()
    }
  }, [templateKey, data.customization])

  const templateStyle = templateKey ? getTemplateStyle(templateKey) : null
  const effectiveSupportsPhoto = templateStyle?.supportsPhoto ?? supportsPhoto

  return (
    <div 
      ref={previewRef}
      data-resume-preview
      className="resume-preview-container bg-white mx-auto"
      style={{ 
        width: '100%',
        maxWidth: '8.5in',
        minHeight: '600px',
      }}
      suppressHydrationWarning
    >
      {/* Header */}
      <div className="resume-header">
        {effectiveSupportsPhoto && data.personalInfo.photo && (
          <div className="resume-photo">
            <img 
              src={data.personalInfo.photo} 
              alt="Profile Photo" 
              className="photo-img"
              crossOrigin="anonymous"
            />
          </div>
        )}
        <div className="resume-header-content">
          <h1 className="resume-name">
            {data.personalInfo.fullName || 'Your Name'}
          </h1>
          <div className="resume-contact">
            {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
            {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
            {data.personalInfo.linkedIn && (
              <span><a href={data.personalInfo.linkedIn}>LinkedIn</a></span>
            )}
            {data.personalInfo.website && (
              <span><a href={data.personalInfo.website}>Website</a></span>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="resume-section">
          <h2 className="section-title">Professional Summary</h2>
          <p className="section-content">{data.summary}</p>
        </div>
      )}

      {/* Work Experience */}
      {data.workExperience.length > 0 && (
        <div className="resume-section">
          <h2 className="section-title">Work Experience</h2>
          {data.workExperience.map((exp, idx) => (
            <div key={idx} className="experience-item">
              <div className="experience-header">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="experience-position">{exp.position || 'Position'}</h3>
                    <span className="experience-dates">
                      | {exp.startDate || ''} — {exp.current ? 'Present' : (exp.endDate || '')}
                    </span>
                  </div>
                  <div className="experience-company-location">
                    {exp.company || 'Company'}{exp.location ? ` - ${exp.location}` : ''}
                  </div>
                </div>
              </div>
              {exp.description && exp.description.length > 0 && (
                <ul className="experience-bullets" style={{ listStyleType: 'disc', listStylePosition: 'outside' }}>
                  {exp.description.map((bullet, i) => (
                    <li key={i} style={{ display: 'list-item', listStyleType: 'disc' }}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="resume-section">
          <h2 className="section-title">Education</h2>
          {data.education.map((edu, idx) => (
            <div key={idx} className="education-item">
              <div className="education-header">
                <h3 className="education-degree">{edu.degree || 'Degree'}</h3>
                {(edu.startDate || edu.endDate) && (
                  <span className="education-dates">
                    | {edu.startDate || ''} — {edu.endDate || ''}
                  </span>
                )}
              </div>
              <p className="education-institution">{edu.institution || 'Institution'}</p>
              {edu.field && <p className="education-field">{edu.field}</p>}
              {edu.gpa && <p className="education-gpa">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div className="resume-section">
          <h2 className="section-title">Skills</h2>
          {data.skills.map((skillGroup, idx) => (
            <div key={idx} className="skills-group">
              {skillGroup.category && skillGroup.category !== 'Skills' && (
                <h3 className="skills-category">{skillGroup.category}</h3>
              )}
              <ul className="skills-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', listStyleType: 'disc', listStylePosition: 'outside' }}>
                {skillGroup.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="skills-item" style={{ display: 'list-item', listStyleType: 'disc' }}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div className="resume-section">
          <h2 className="section-title">Certifications</h2>
          {data.certifications.map((cert, idx) => (
            <div key={idx} className="certification-item">
              <h3 className="certification-name">{cert.name}</h3>
              <p className="certification-issuer">{cert.issuer}</p>
              <p className="certification-date">
                {cert.date}{cert.expiryDate ? ` - Expires: ${cert.expiryDate}` : ''}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Languages */}
      {data.languages && data.languages.length > 0 && (
        <div className="resume-section">
          <h2 className="section-title">Languages</h2>
          <div className="languages-list">
            {data.languages.map((lang, idx) => (
              <span key={idx} className="language-item">
                {lang.language} - {lang.proficiency}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getBaseStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    .resume-preview-container {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #333;
      background: #fff;
    }
    
    .resume-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #333;
    }
    
    .resume-photo {
      margin-right: 20px;
    }
    
    .photo-img {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #333;
    }
    
    .resume-header-content {
      flex: 1;
    }
    
    .resume-name {
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 8px;
      color: #1a1a1a;
    }
    
    @media (min-width: 640px) {
      .resume-name {
        font-size: 24pt;
      }
    }
    
    .resume-contact {
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      gap: 5px;
      font-size: 9pt;
      color: #666;
      align-items: center;
    }
    
    @media (min-width: 640px) {
      .resume-contact {
        flex-direction: row;
        gap: 10px;
        font-size: 10pt;
        align-items: center;
      }
    }
    
    .resume-contact span {
      display: flex;
      align-items: center;
    }
    
    .resume-contact a {
      color: #0066cc;
      text-decoration: none;
    }
    
    .resume-section {
      margin-bottom: 20px;
    }
    
    .section-title {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #ccc;
      color: #1a1a1a;
    }
    
    .section-content {
      text-align: justify;
      line-height: 1.6;
      margin-top: 8px;
      margin-bottom: 0;
      padding: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    .experience-item,
    .education-item,
    .certification-item {
      margin-bottom: 15px;
    }
    
    .experience-header {
      margin-bottom: 8px;
    }
    
    .experience-position {
      font-size: 12pt;
      font-weight: bold;
      color: #1a1a1a;
      text-transform: uppercase;
    }
    
    .experience-company-location {
      font-weight: 500;
      color: #333;
      margin-top: 2px;
      font-size: 10.5pt;
    }
    
    .experience-dates {
      font-size: 10pt;
      color: #333;
      font-weight: normal;
    }
    
    .resume-preview-container .experience-bullets {
      margin: 8px 0 8px 20px !important;
      padding-left: 20px !important;
      list-style-type: disc !important;
      list-style-position: outside !important;
    }
    
    .resume-preview-container .experience-bullets li {
      margin-bottom: 6px;
      line-height: 1.6;
      padding-left: 4px;
      text-align: left;
      display: list-item !important;
      list-style-type: disc !important;
    }
    
    .resume-preview-container .experience-bullets li::marker {
      color: #000 !important;
      font-size: 0.9em;
      font-weight: bold;
    }
    
    .education-header {
      display: flex;
      align-items: baseline;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 2px;
    }
    
    .education-degree {
      font-size: 12pt;
      font-weight: bold;
      color: #1a1a1a;
    }
    
    .education-dates {
      font-size: 10pt;
      color: #333;
      font-weight: normal;
    }
    
    .education-institution {
      font-weight: 600;
      color: #333;
      margin-top: 2px;
    }
    
    .education-field,
    .education-gpa {
      font-size: 10pt;
      color: #666;
      margin-top: 2px;
    }
    
    .skills-group {
      margin-bottom: 15px;
    }
    
    .skills-category {
      font-weight: 600;
      margin-bottom: 8px;
      color: #333;
      font-size: 11pt;
    }
    
    .resume-preview-container .skills-list {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr) !important;
      column-gap: 30px;
      row-gap: 6px;
      margin: 0 0 0 20px !important;
      padding-left: 20px !important;
      list-style-type: disc !important;
      list-style-position: outside !important;
    }
    
    .resume-preview-container .skills-item {
      margin-bottom: 4px;
      line-height: 1.5;
      padding-left: 4px;
      color: #333;
      display: list-item !important;
      list-style-type: disc !important;
    }
    
    .resume-preview-container .skills-item::marker {
      color: #000 !important;
      font-size: 0.9em;
      font-weight: bold;
    }
    
    @media (max-width: 600px) {
      .resume-preview-container .skills-list {
        grid-template-columns: 1fr !important;
      }
    }
    
    .certification-name {
      font-size: 11pt;
      font-weight: bold;
      color: #1a1a1a;
    }
    
    .certification-issuer {
      font-weight: 600;
      color: #333;
      margin-top: 2px;
    }
    
    .certification-date {
      font-size: 10pt;
      color: #666;
      margin-top: 2px;
    }
    
    .languages-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .language-item {
      padding: 3px 8px;
      background: #f5f5f5;
      border-radius: 3px;
      font-size: 10pt;
    }
  `
}
