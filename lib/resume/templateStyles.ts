// Professional Resume Template Styles
// Multiple template designs for different professional needs

export interface TemplateStyle {
  name: string
  category: string
  description: string
  supportsPhoto: boolean
  isPremium: boolean
  getStyles: () => string
}

// Modern Professional Template - Clean, contemporary design
export const modernProfessional: TemplateStyle = {
  name: 'Modern Professional',
  category: 'modern',
  description: 'Clean, contemporary design perfect for tech and creative industries',
  supportsPhoto: true,
  isPremium: false,
  getStyles: () => `
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      color: #2c3e50;
    }
    
    .resume-container {
      background: #ffffff;
    }
    
    .resume-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 40px;
      margin: -0.5in -0.5in 30px -0.5in;
      border-bottom: none;
    }
    
    .resume-name {
      color: white;
      font-size: 32pt;
      font-weight: 300;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }
    
    .resume-contact {
      color: rgba(255, 255, 255, 0.9);
      font-size: 10pt;
    }
    
    .resume-contact a {
      color: rgba(255, 255, 255, 0.9);
    }
    
    .resume-contact a:hover {
      text-decoration: underline;
    }
    
    .section-title {
      color: #667eea;
      border-bottom: 3px solid #667eea;
      padding-bottom: 8px;
      font-size: 16pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .experience-position {
      color: #667eea;
    }
    
    .photo-img {
      border: 4px solid white;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
  `
}

// Classic Traditional Template - Timeless, professional design
export const classicTraditional: TemplateStyle = {
  name: 'Classic Traditional',
  category: 'classic',
  description: 'Timeless design ideal for finance, law, and corporate roles',
  supportsPhoto: false,
  isPremium: false,
  getStyles: () => `
    body {
      font-family: 'Times New Roman', 'Georgia', serif;
      color: #1a1a1a;
    }
    
    .resume-container {
      background: #ffffff;
    }
    
    .resume-header {
      border-bottom: 3px solid #1a1a1a;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    
    .resume-name {
      font-size: 28pt;
      font-weight: bold;
      color: #1a1a1a;
      text-align: center;
      margin-bottom: 10px;
    }
    
    .resume-contact {
      justify-content: center;
      font-size: 10pt;
      color: #555;
    }
    
    .section-title {
      color: #1a1a1a;
      border-bottom: 2px solid #1a1a1a;
      padding-bottom: 5px;
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    
    .experience-header {
      border-left: 3px solid #1a1a1a;
      padding-left: 15px;
    }
    
    .experience-position {
      color: #1a1a1a;
      font-weight: bold;
    }
    
    .section-content {
      text-align: justify;
    }
  `
}

// Creative Design Template - Bold, eye-catching design
export const creativeDesign: TemplateStyle = {
  name: 'Creative Design',
  category: 'creative',
  description: 'Bold design perfect for designers, artists, and marketing professionals',
  supportsPhoto: true,
  isPremium: false,
  getStyles: () => `
    body {
      font-family: 'Montserrat', 'Arial', sans-serif;
      color: #2c3e50;
    }
    
    .resume-container {
      background: #f8f9fa;
    }
    
    .resume-header {
      background: #2c3e50;
      color: white;
      padding: 25px 40px;
      margin: -0.5in -0.5in 25px -0.5in;
      display: flex;
      align-items: center;
      gap: 30px;
    }
    
    .resume-name {
      color: white;
      font-size: 36pt;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .resume-contact {
      color: rgba(255, 255, 255, 0.85);
      font-size: 10pt;
    }
    
    .resume-contact a {
      color: rgba(255, 255, 255, 0.85);
    }
    
    .section-title {
      color: #e74c3c;
      border-left: 5px solid #e74c3c;
      padding-left: 15px;
      border-bottom: none;
      font-size: 18pt;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 15px;
    }
    
    .experience-item {
      background: white;
      padding: 15px;
      margin-bottom: 15px;
      border-left: 4px solid #e74c3c;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .experience-position {
      color: #e74c3c;
      font-weight: 700;
    }
    
    .photo-img {
      border: 5px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    
    .skills-group {
      background: white;
      padding: 12px;
      margin-bottom: 10px;
      border-radius: 4px;
    }
  `
}

// Timeline Template - Chronological, narrative-focused design
export const timelineTemplate: TemplateStyle = {
  name: 'Timeline',
  category: 'modern',
  description: 'Chronological layout that tells your career story',
  supportsPhoto: true,
  isPremium: true,
  getStyles: () => `
    body {
      font-family: 'Open Sans', 'Arial', sans-serif;
      color: #34495e;
    }
    
    .resume-container {
      background: #ffffff;
      position: relative;
    }
    
    .resume-header {
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
      color: white;
      padding: 35px 40px;
      margin: -0.5in -0.5in 40px -0.5in;
      border-bottom: none;
    }
    
    .resume-name {
      color: white;
      font-size: 34pt;
      font-weight: 400;
      margin-bottom: 12px;
    }
    
    .resume-contact {
      color: rgba(255, 255, 255, 0.9);
      font-size: 10pt;
    }
    
    .resume-contact a {
      color: rgba(255, 255, 255, 0.9);
    }
    
    .resume-section {
      position: relative;
      padding-left: 40px;
      margin-bottom: 30px;
    }
    
    .resume-section::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: linear-gradient(to bottom, #3498db, #2980b9);
    }
    
    .section-title {
      color: #3498db;
      border-bottom: none;
      padding-bottom: 0;
      font-size: 18pt;
      font-weight: 600;
      margin-bottom: 20px;
      position: relative;
      padding-left: 20px;
    }
    
    .section-title::before {
      content: '';
      position: absolute;
      left: -45px;
      top: 50%;
      transform: translateY(-50%);
      width: 12px;
      height: 12px;
      background: #3498db;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 0 3px #3498db;
    }
    
    .experience-item {
      margin-bottom: 25px;
      padding-left: 20px;
      position: relative;
    }
    
    .experience-item::before {
      content: '';
      position: absolute;
      left: -35px;
      top: 5px;
      width: 8px;
      height: 8px;
      background: #3498db;
      border-radius: 50%;
    }
    
    .experience-position {
      color: #3498db;
      font-weight: 600;
    }
    
    .photo-img {
      border: 4px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
  `
}

// Minimalist Template - Clean, simple, ATS-friendly
export const minimalistTemplate: TemplateStyle = {
  name: 'Minimalist',
  category: 'classic',
  description: 'Ultra-clean design optimized for ATS systems',
  supportsPhoto: false,
  isPremium: false,
  getStyles: () => `
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      color: #000000;
    }
    
    .resume-container {
      background: #ffffff;
    }
    
    .resume-header {
      border-bottom: 1px solid #000000;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    
    .resume-name {
      font-size: 24pt;
      font-weight: bold;
      color: #000000;
      margin-bottom: 8px;
    }
    
    .resume-contact {
      font-size: 10pt;
      color: #000000;
    }
    
    .resume-contact a {
      color: #000000;
      text-decoration: underline;
    }
    
    .section-title {
      color: #000000;
      border-bottom: 1px solid #000000;
      padding-bottom: 3px;
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .experience-item {
      margin-bottom: 12px;
    }
    
    .experience-position {
      color: #000000;
      font-weight: bold;
    }
    
    .section-content {
      text-align: left;
    }
    
    /* ATS-friendly: no fancy styling */
    * {
      background: transparent !important;
      box-shadow: none !important;
    }
  `
}

// Executive Template - Premium, sophisticated design
export const executiveTemplate: TemplateStyle = {
  name: 'Executive',
  category: 'premium',
  description: 'Sophisticated design for senior executives and C-level positions',
  supportsPhoto: true,
  isPremium: true,
  getStyles: () => `
    body {
      font-family: 'Garamond', 'Georgia', serif;
      color: #1a1a1a;
    }
    
    .resume-container {
      background: #fafafa;
      border: 1px solid #e0e0e0;
    }
    
    .resume-header {
      background: #1a1a1a;
      color: #f5f5f5;
      padding: 40px;
      margin: -0.5in -0.5in 35px -0.5in;
      border-bottom: 4px solid #d4af37;
    }
    
    .resume-name {
      color: #f5f5f5;
      font-size: 32pt;
      font-weight: 300;
      letter-spacing: 3px;
      margin-bottom: 12px;
      text-transform: uppercase;
    }
    
    .resume-contact {
      color: #d4af37;
      font-size: 10pt;
      letter-spacing: 1px;
    }
    
    .resume-contact a {
      color: #d4af37;
    }
    
    .section-title {
      color: #1a1a1a;
      border-bottom: 2px solid #d4af37;
      padding-bottom: 8px;
      font-size: 14pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .experience-item {
      border-left: 2px solid #d4af37;
      padding-left: 20px;
      margin-bottom: 20px;
    }
    
    .experience-position {
      color: #1a1a1a;
      font-weight: 600;
    }
    
    .photo-img {
      border: 3px solid #d4af37;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }
    
    .section-content {
      text-align: justify;
      line-height: 1.8;
    }
  `
}

// Ocean Blue Template - Fresh blue gradient theme
export const oceanBlue: TemplateStyle = {
  name: 'Ocean Blue',
  category: 'modern',
  description: 'Fresh blue gradient design perfect for tech and finance',
  supportsPhoto: true,
  isPremium: false,
  getStyles: () => `
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      color: #2c3e50;
    }
    
    .resume-container {
      background: #ffffff;
    }
    
    .resume-header {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
      padding: 30px 40px;
      margin: -0.5in -0.5in 30px -0.5in;
      border-bottom: none;
    }
    
    .resume-name {
      color: white;
      font-size: 32pt;
      font-weight: 300;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }
    
    .resume-contact {
      color: rgba(255, 255, 255, 0.95);
      font-size: 10pt;
    }
    
    .section-title {
      color: #4facfe;
      border-bottom: 3px solid #4facfe;
      padding-bottom: 8px;
      font-size: 16pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .experience-position {
      color: #4facfe;
    }
    
    .photo-img {
      border: 4px solid white;
      box-shadow: 0 4px 8px rgba(79, 172, 254, 0.3);
    }
  `
}

// Forest Green Template - Natural green theme
export const forestGreen: TemplateStyle = {
  name: 'Forest Green',
  category: 'classic',
  description: 'Natural green design ideal for environmental and healthcare roles',
  supportsPhoto: true,
  isPremium: false,
  getStyles: () => `
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      color: #2c3e50;
    }
    
    .resume-container {
      background: #ffffff;
    }
    
    .resume-header {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      color: white;
      padding: 30px 40px;
      margin: -0.5in -0.5in 30px -0.5in;
      border-bottom: none;
    }
    
    .resume-name {
      color: white;
      font-size: 30pt;
      font-weight: 400;
      letter-spacing: 1.5px;
      margin-bottom: 10px;
    }
    
    .resume-contact {
      color: rgba(255, 255, 255, 0.95);
      font-size: 10pt;
    }
    
    .section-title {
      color: #11998e;
      border-bottom: 2px solid #11998e;
      padding-bottom: 6px;
      font-size: 15pt;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .experience-position {
      color: #11998e;
      font-weight: 600;
    }
    
    .photo-img {
      border: 4px solid white;
      box-shadow: 0 4px 8px rgba(17, 153, 142, 0.3);
    }
  `
}

// Sunset Orange Template - Warm orange/red gradient
export const sunsetOrange: TemplateStyle = {
  name: 'Sunset Orange',
  category: 'creative',
  description: 'Warm orange gradient perfect for creative and marketing roles',
  supportsPhoto: true,
  isPremium: false,
  getStyles: () => `
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      color: #2c3e50;
    }
    
    .resume-container {
      background: #ffffff;
    }
    
    .resume-header {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 30px 40px;
      margin: -0.5in -0.5in 30px -0.5in;
      border-bottom: none;
    }
    
    .resume-name {
      color: white;
      font-size: 32pt;
      font-weight: 300;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }
    
    .resume-contact {
      color: rgba(255, 255, 255, 0.95);
      font-size: 10pt;
    }
    
    .section-title {
      color: #f5576c;
      border-bottom: 3px solid #f5576c;
      padding-bottom: 8px;
      font-size: 16pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .experience-position {
      color: #f5576c;
    }
    
    .photo-img {
      border: 4px solid white;
      box-shadow: 0 4px 8px rgba(245, 87, 108, 0.3);
    }
  `
}

// Royal Purple Template - Deep purple theme
export const royalPurple: TemplateStyle = {
  name: 'Royal Purple',
  category: 'premium',
  description: 'Elegant purple design for executive and leadership roles',
  supportsPhoto: true,
  isPremium: true,
  getStyles: () => `
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      color: #2c3e50;
    }
    
    .resume-container {
      background: #ffffff;
    }
    
    .resume-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 35px 40px;
      margin: -0.5in -0.5in 35px -0.5in;
      border-bottom: none;
    }
    
    .resume-name {
      color: white;
      font-size: 34pt;
      font-weight: 400;
      letter-spacing: 2px;
      margin-bottom: 12px;
    }
    
    .resume-contact {
      color: rgba(255, 255, 255, 0.95);
      font-size: 10pt;
    }
    
    .section-title {
      color: #764ba2;
      border-bottom: 3px solid #764ba2;
      padding-bottom: 8px;
      font-size: 16pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    
    .experience-position {
      color: #764ba2;
      font-weight: 600;
    }
    
    .photo-img {
      border: 5px solid white;
      box-shadow: 0 4px 12px rgba(118, 75, 162, 0.4);
    }
  `
}

// Midnight Dark Template - Dark theme with light accents
export const midnightDark: TemplateStyle = {
  name: 'Midnight Dark',
  category: 'modern',
  description: 'Sophisticated dark theme perfect for tech and design roles',
  supportsPhoto: true,
  isPremium: true,
  getStyles: () => `
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      color: #e0e0e0;
      background: #1a1a1a;
    }
    
    .resume-container {
      background: #2d2d2d;
      color: #e0e0e0;
    }
    
    .resume-header {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      color: white;
      padding: 30px 40px;
      margin: -0.5in -0.5in 30px -0.5in;
      border-bottom: 3px solid #00d4ff;
    }
    
    .resume-name {
      color: white;
      font-size: 32pt;
      font-weight: 300;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }
    
    .resume-contact {
      color: rgba(255, 255, 255, 0.8);
      font-size: 10pt;
    }
    
    .section-title {
      color: #00d4ff;
      border-bottom: 2px solid #00d4ff;
      padding-bottom: 6px;
      font-size: 16pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .experience-position {
      color: #00d4ff;
    }
    
    .section-content {
      color: #e0e0e0;
    }
    
    .photo-img {
      border: 4px solid #00d4ff;
      box-shadow: 0 4px 8px rgba(0, 212, 255, 0.3);
    }
  `
}

// Coral Pink Template - Soft pink/coral theme
export const coralPink: TemplateStyle = {
  name: 'Coral Pink',
  category: 'creative',
  description: 'Soft pink design ideal for creative and design professionals',
  supportsPhoto: true,
  isPremium: false,
  getStyles: () => `
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      color: #2c3e50;
    }
    
    .resume-container {
      background: #ffffff;
    }
    
    .resume-header {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
      color: white;
      padding: 30px 40px;
      margin: -0.5in -0.5in 30px -0.5in;
      border-bottom: none;
    }
    
    .resume-name {
      color: white;
      font-size: 32pt;
      font-weight: 300;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }
    
    .resume-contact {
      color: rgba(255, 255, 255, 0.95);
      font-size: 10pt;
    }
    
    .section-title {
      color: #ff9a9e;
      border-bottom: 3px solid #ff9a9e;
      padding-bottom: 8px;
      font-size: 16pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .experience-position {
      color: #ff9a9e;
    }
    
    .photo-img {
      border: 4px solid white;
      box-shadow: 0 4px 8px rgba(255, 154, 158, 0.3);
    }
  `
}

// Teal Modern Template - Fresh teal/cyan theme
export const tealModern: TemplateStyle = {
  name: 'Teal Modern',
  category: 'modern',
  description: 'Fresh teal design perfect for healthcare and consulting',
  supportsPhoto: true,
  isPremium: false,
  getStyles: () => `
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      color: #2c3e50;
    }
    
    .resume-container {
      background: #ffffff;
    }
    
    .resume-header {
      background: linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%);
      color: white;
      padding: 30px 40px;
      margin: -0.5in -0.5in 30px -0.5in;
      border-bottom: none;
    }
    
    .resume-name {
      color: white;
      font-size: 32pt;
      font-weight: 300;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }
    
    .resume-contact {
      color: rgba(255, 255, 255, 0.95);
      font-size: 10pt;
    }
    
    .section-title {
      color: #00c9ff;
      border-bottom: 3px solid #00c9ff;
      padding-bottom: 8px;
      font-size: 16pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .experience-position {
      color: #00c9ff;
    }
    
    .photo-img {
      border: 4px solid white;
      box-shadow: 0 4px 8px rgba(0, 201, 255, 0.3);
    }
  `
}

// Gold Elegant Template - Luxurious gold/yellow theme
export const goldElegant: TemplateStyle = {
  name: 'Gold Elegant',
  category: 'premium',
  description: 'Luxurious gold design for executive and finance roles',
  supportsPhoto: true,
  isPremium: true,
  getStyles: () => `
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      color: #2c3e50;
    }
    
    .resume-container {
      background: #ffffff;
    }
    
    .resume-header {
      background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
      color: #1a1a1a;
      padding: 35px 40px;
      margin: -0.5in -0.5in 35px -0.5in;
      border-bottom: none;
    }
    
    .resume-name {
      color: #1a1a1a;
      font-size: 34pt;
      font-weight: 400;
      letter-spacing: 2px;
      margin-bottom: 12px;
    }
    
    .resume-contact {
      color: rgba(26, 26, 26, 0.8);
      font-size: 10pt;
    }
    
    .section-title {
      color: #f6d365;
      border-bottom: 3px solid #f6d365;
      padding-bottom: 8px;
      font-size: 16pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    
    .experience-position {
      color: #f6d365;
      font-weight: 600;
    }
    
    .photo-img {
      border: 5px solid white;
      box-shadow: 0 4px 12px rgba(246, 211, 101, 0.4);
    }
  `
}

// Navy Professional Template - Classic navy blue theme
export const navyProfessional: TemplateStyle = {
  name: 'Navy Professional',
  category: 'classic',
  description: 'Classic navy design ideal for corporate and legal roles',
  supportsPhoto: false,
  isPremium: false,
  getStyles: () => `
    body {
      font-family: 'Times New Roman', 'Georgia', serif;
      color: #1a1a1a;
    }
    
    .resume-container {
      background: #ffffff;
    }
    
    .resume-header {
      background: #1e3a8a;
      color: white;
      padding: 25px 40px;
      margin: -0.5in -0.5in 25px -0.5in;
      border-bottom: 4px solid #3b82f6;
    }
    
    .resume-name {
      color: white;
      font-size: 28pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 10px;
    }
    
    .resume-contact {
      color: rgba(255, 255, 255, 0.9);
      font-size: 10pt;
      justify-content: center;
    }
    
    .section-title {
      color: #1e3a8a;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 6px;
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .experience-position {
      color: #1e3a8a;
      font-weight: bold;
    }
  `
}

// Emerald Classic Template - Rich emerald green theme
export const emeraldClassic: TemplateStyle = {
  name: 'Emerald Classic',
  category: 'classic',
  description: 'Rich emerald design perfect for finance and consulting',
  supportsPhoto: true,
  isPremium: false,
  getStyles: () => `
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      color: #2c3e50;
    }
    
    .resume-container {
      background: #ffffff;
    }
    
    .resume-header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px 40px;
      margin: -0.5in -0.5in 30px -0.5in;
      border-bottom: none;
    }
    
    .resume-name {
      color: white;
      font-size: 30pt;
      font-weight: 400;
      letter-spacing: 1.5px;
      margin-bottom: 10px;
    }
    
    .resume-contact {
      color: rgba(255, 255, 255, 0.95);
      font-size: 10pt;
    }
    
    .section-title {
      color: #059669;
      border-bottom: 2px solid #059669;
      padding-bottom: 6px;
      font-size: 15pt;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .experience-position {
      color: #059669;
      font-weight: 600;
    }
    
    .photo-img {
      border: 4px solid white;
      box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);
    }
  `
}

// All available templates
export const templateStyles: Record<string, TemplateStyle> = {
  'modern-professional': modernProfessional,
  'classic-traditional': classicTraditional,
  'creative-design': creativeDesign,
  'timeline': timelineTemplate,
  'minimalist': minimalistTemplate,
  'executive': executiveTemplate,
  'ocean-blue': oceanBlue,
  'forest-green': forestGreen,
  'sunset-orange': sunsetOrange,
  'royal-purple': royalPurple,
  'midnight-dark': midnightDark,
  'coral-pink': coralPink,
  'teal-modern': tealModern,
  'gold-elegant': goldElegant,
  'navy-professional': navyProfessional,
  'emerald-classic': emeraldClassic,
}

// Get template style by name/key
export function getTemplateStyle(templateKey: string): TemplateStyle | null {
  return templateStyles[templateKey] || null
}

// Get all template styles
export function getAllTemplateStyles(): TemplateStyle[] {
  return Object.values(templateStyles)
}

// Get templates by category
export function getTemplatesByCategory(category: string): TemplateStyle[] {
  return Object.values(templateStyles).filter(t => t.category === category)
}
