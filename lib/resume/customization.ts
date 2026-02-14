// Resume Customization System
// Allows users to customize colors, fonts, spacing, and other design elements

export interface ResumeCustomization {
  // Colors
  primaryColor: string // Main accent color (headers, links, etc.)
  secondaryColor: string // Secondary accent color
  textColor: string // Main text color
  backgroundColor: string // Background color
  
  // Fonts
  fontFamily: string // Main font family
  headingFont: string // Font for headings
  fontSize: number // Base font size in pt
  
  // Spacing
  sectionSpacing: number // Space between sections
  lineHeight: number // Line height multiplier
  
  // Other
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'none'
  borderWidth: number
  borderRadius: number
}

export const defaultCustomization: ResumeCustomization = {
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  textColor: '#2c3e50',
  backgroundColor: '#ffffff',
  fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  headingFont: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  fontSize: 11,
  sectionSpacing: 20,
  lineHeight: 1.6,
  borderStyle: 'solid',
  borderWidth: 2,
  borderRadius: 0,
}

// Generate CSS from customization settings
export function generateCustomizationCSS(customization: ResumeCustomization): string {
  return `
    :root {
      --resume-primary-color: ${customization.primaryColor};
      --resume-secondary-color: ${customization.secondaryColor};
      --resume-text-color: ${customization.textColor};
      --resume-bg-color: ${customization.backgroundColor};
      --resume-font-family: ${customization.fontFamily};
      --resume-heading-font: ${customization.headingFont};
      --resume-font-size: ${customization.fontSize}pt;
      --resume-section-spacing: ${customization.sectionSpacing}px;
      --resume-line-height: ${customization.lineHeight};
      --resume-border-style: ${customization.borderStyle};
      --resume-border-width: ${customization.borderWidth}px;
      --resume-border-radius: ${customization.borderRadius}px;
    }
    
    body {
      font-family: var(--resume-font-family);
      color: var(--resume-text-color);
      background-color: var(--resume-bg-color);
      font-size: var(--resume-font-size);
      line-height: var(--resume-line-height);
    }
    
    .resume-container {
      background: var(--resume-bg-color);
    }
    
    .section-title {
      color: var(--resume-primary-color);
      border-bottom: var(--resume-border-width) var(--resume-border-style) var(--resume-primary-color);
      margin-bottom: ${customization.sectionSpacing}px;
      padding-bottom: 8px;
    }
    
    .resume-section {
      margin-bottom: var(--resume-section-spacing);
    }
    
    .experience-position,
    .education-degree {
      color: var(--resume-primary-color);
    }
    
    .resume-header {
      background: linear-gradient(135deg, var(--resume-primary-color) 0%, var(--resume-secondary-color) 100%);
    }
    
    a {
      color: var(--resume-primary-color);
    }
    
    h1, h2, h3 {
      font-family: var(--resume-heading-font);
    }
  `
}

// Apply customization to template styles
export function applyCustomizationToTemplate(
  templateCSS: string,
  customization: ResumeCustomization
): string {
  const customizationCSS = generateCustomizationCSS(customization)
  return `${customizationCSS}\n\n${templateCSS}`
}
