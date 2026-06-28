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
// Scoped to .resume-preview-container to avoid leaking styles to the page
export function generateCustomizationCSS(customization: ResumeCustomization): string {
  return `
    .resume-preview-container {
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

      font-family: ${customization.fontFamily} !important;
      color: ${customization.textColor} !important;
      background-color: ${customization.backgroundColor} !important;
      font-size: ${customization.fontSize}pt !important;
      line-height: ${customization.lineHeight} !important;
    }

    .resume-preview-container .section-title {
      color: ${customization.primaryColor} !important;
      border-bottom: ${customization.borderWidth}px ${customization.borderStyle} ${customization.primaryColor} !important;
      margin-bottom: ${customization.sectionSpacing}px !important;
      padding-bottom: 8px;
    }

    .resume-preview-container .resume-section {
      margin-bottom: ${customization.sectionSpacing}px !important;
    }

    .resume-preview-container .experience-position,
    .resume-preview-container .education-degree {
      color: ${customization.primaryColor} !important;
    }

    .resume-preview-container .resume-header {
      background: linear-gradient(135deg, ${customization.primaryColor} 0%, ${customization.secondaryColor} 100%) !important;
    }

    .resume-preview-container a {
      color: ${customization.primaryColor} !important;
    }

    .resume-preview-container h1,
    .resume-preview-container h2,
    .resume-preview-container h3 {
      font-family: ${customization.headingFont} !important;
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
