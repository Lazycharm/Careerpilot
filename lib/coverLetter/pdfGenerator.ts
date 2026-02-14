/**
 * Cover Letter PDF Generator
 * Converts cover letter content to HTML for PDF generation
 */

export function renderCoverLetterToHTML(content: string): string {
  // Parse the cover letter content and format it properly
  const lines = content.split('\n')
  
  // Separate header, recipient, body, and footer sections
  let headerLines: string[] = []
  let recipientLines: string[] = []
  let bodyLines: string[] = []
  let footerLines: string[] = []
  let currentSection: 'header' | 'recipient' | 'body' | 'footer' | 'none' = 'none'
  let foundHeader = false
  let foundRecipient = false
  let foundFooter = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const isEmpty = !line
    
    // Skip empty lines but use them as section separators
    if (isEmpty) {
      if (currentSection === 'header' && headerLines.length > 0) {
        currentSection = 'none'
        foundHeader = true
      } else if (currentSection === 'recipient' && recipientLines.length > 0) {
        currentSection = 'body'
        foundRecipient = true
      }
      continue
    }
    
    // Detect header section (usually first section with contact info)
    if (!foundHeader && (
      line.includes('@') || 
      line.includes('Phone') || 
      line.includes('Email') || 
      line.includes('Location') ||
      line.match(/^\+?\d[\d\s\-\(\)]+/) || // Phone number pattern
      (i < 6 && !line.startsWith('To') && !line.startsWith('Dear')) // First few lines that aren't recipient
    )) {
      if (currentSection !== 'header') {
        currentSection = 'header'
      }
      headerLines.push(line)
      continue
    }
    
    // Detect recipient section (starts with "To" or "Dear")
    if (!foundRecipient && (line.startsWith('To') || line.startsWith('Dear'))) {
      currentSection = 'recipient'
      recipientLines.push(line)
      continue
    }
    
    // If we're in recipient section, continue until empty line
    if (currentSection === 'recipient') {
      recipientLines.push(line)
      continue
    }
    
    // Everything else is body (unless we've found footer)
    if (foundFooter) {
      footerLines.push(line)
    } else if (foundHeader || foundRecipient || currentSection === 'body') {
      currentSection = 'body'
      bodyLines.push(line)
    } else if (headerLines.length > 0) {
      // If we have header but haven't found recipient yet, might be recipient or body
      if (line.startsWith('To') || line.startsWith('Dear')) {
        currentSection = 'recipient'
        recipientLines.push(line)
      } else {
        bodyLines.push(line)
      }
    } else {
      // No header found yet, might be header or body
      if (i < 5 && (line.includes('@') || line.match(/^\+?\d/))) {
        headerLines.push(line)
        currentSection = 'header'
      } else {
        bodyLines.push(line)
        currentSection = 'body'
      }
    }
  }
  
  // If we didn't detect sections properly, use simple parsing
  if (headerLines.length === 0 && recipientLines.length === 0 && bodyLines.length === 0 && footerLines.length === 0) {
    // Fallback: treat first few non-empty lines as header if they look like contact info
    const firstLines = lines.filter(l => l.trim()).slice(0, 10)
    if (firstLines.length > 0) {
      const firstLine = firstLines[0].trim()
      if (firstLine.includes('@') || firstLine.match(/^\+?\d/) || firstLines.length <= 3) {
        headerLines = firstLines.slice(0, Math.min(5, firstLines.length))
        bodyLines = lines.slice(firstLines.length)
      } else {
        bodyLines = lines
      }
    } else {
      bodyLines = lines
    }
  }
  
  // Try to detect footer if not already found - look for closing phrases near the end
  if (!foundFooter && bodyLines.length > 0) {
    const lastFewLines = bodyLines.slice(-5)
    for (let j = lastFewLines.length - 1; j >= 0; j--) {
      const line = lastFewLines[j].trim()
      if (line.match(/^(Sincerely|Best regards|Yours sincerely|Yours truly|Respectfully|Regards|Warm regards|Kind regards),?$/i)) {
        // Found closing, move everything from here to footer
        const closingIndex = bodyLines.length - lastFewLines.length + j
        footerLines = bodyLines.slice(closingIndex)
        bodyLines = bodyLines.slice(0, closingIndex)
        foundFooter = true
        break
      }
    }
  }
  
  // Build HTML
  const headerHTML = headerLines.length > 0
    ? `<div class="cover-letter-header">
        ${headerLines.map((line, idx) => 
          `<div class="header-line ${idx === 0 ? 'header-name' : ''}">${escapeHtml(line)}</div>`
        ).join('')}
      </div>`
    : ''
  
  const recipientHTML = recipientLines.length > 0
    ? `<div class="cover-letter-recipient">
        ${recipientLines.map(line => `<div>${escapeHtml(line)}</div>`).join('')}
      </div>`
    : ''
  
  // Format body paragraphs
  const bodyHTML = formatBodyContent(bodyLines)
  
  // Format footer/closing section — clearly separated from body
  const footerHTML = footerLines.length > 0
    ? `<div class="cover-letter-footer">
        ${footerLines.map((line) => {
          const trimmed = line.trim()
          const isClosing = trimmed.match(/^(Sincerely|Best regards|Yours sincerely|Yours truly|Respectfully|Regards|Warm regards|Kind regards),?$/i)
          if (isClosing) {
            return `<div class="cover-letter-closing">${escapeHtml(trimmed)}</div>`
          } else if (trimmed) {
            return `<div class="cover-letter-signature">${escapeHtml(trimmed)}</div>`
          }
          return ''
        }).filter(Boolean).join('')}
      </div>`
    : ''
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cover Letter</title>
      <style>
        ${getCoverLetterStyles()}
      </style>
    </head>
    <body>
      <div class="cover-letter-container">
        ${headerHTML}
        ${recipientHTML}
        <div class="cover-letter-body">
          ${bodyHTML}
        </div>
        ${footerHTML}
      </div>
    </body>
    </html>
  `
}

function formatBodyContent(lines: string[]): string {
  const paragraphs: string[] = []
  let currentParagraph: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    if (!trimmed) {
      if (currentParagraph.length > 0) {
        paragraphs.push(`<p class="cover-letter-paragraph">${currentParagraph.join(' ')}</p>`)
        currentParagraph = []
      }
      continue
    }
    
    // Check if it's a bullet point
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      if (currentParagraph.length > 0) {
        paragraphs.push(`<p class="cover-letter-paragraph">${currentParagraph.join(' ')}</p>`)
        currentParagraph = []
      }
      paragraphs.push(`<div class="cover-letter-bullet">${escapeHtml(trimmed)}</div>`)
    } else {
      currentParagraph.push(escapeHtml(trimmed))
    }
  }
  
  if (currentParagraph.length > 0) {
    paragraphs.push(`<p class="cover-letter-paragraph">${currentParagraph.join(' ')}</p>`)
  }
  
  return paragraphs.join('')
}

function getCoverLetterStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
      background: #fff;
      padding: 0;
      margin: 0;
    }
    
    .cover-letter-container {
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.75in 0.5in;
      background: white;
    }
    
    .cover-letter-header {
      text-align: right;
      margin-bottom: 2em;
      line-height: 1.8;
    }
    
    .header-line {
      font-size: 11pt;
      color: #333;
    }
    
    .header-name {
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 0.3em;
    }
    
    .cover-letter-recipient {
      margin-bottom: 1.5em;
      line-height: 1.8;
    }
    
    .cover-letter-recipient div {
      margin-bottom: 0.3em;
    }
    
    .cover-letter-body {
      line-height: 1.8;
    }
    
    .cover-letter-paragraph {
      margin-bottom: 1em;
      text-align: justify;
      text-justify: inter-word;
    }
    
    .cover-letter-bullet {
      margin-bottom: 0.5em;
      margin-left: 1.5em;
      padding-left: 0.5em;
    }
    
    .cover-letter-footer {
      margin-top: 2.5em;
      padding-top: 1.25em;
      page-break-inside: avoid;
      clear: both;
    }
    
    .cover-letter-closing {
      margin-bottom: 0.75em;
      font-size: 11pt;
      color: #333;
    }
    
    .cover-letter-signature {
      font-weight: bold;
      font-size: 11pt;
      color: #333;
    }
    
    @page {
      size: A4;
      margin: 0.75in 0.5in;
    }
    
    @media print {
      .cover-letter-container {
        padding: 0;
      }
    }
  `
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
