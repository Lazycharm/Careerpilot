# Resume Template System

## Source of Truth

Templates are defined in **code**, not the database.

**Registry:** `lib/resume/templates/registry.ts`
**API:** `app/api/resumes/templates/route.ts` reads from registry (not DB)

The `ResumeTemplate` DB model is legacy — kept for backward compat but not used for template listing.

## Template Types

### 1. React Component Templates (`.tsx`)

Traditional templates built as React components. Each lives in `lib/resume/templates/<key>/Template.tsx`.

Rendered server-side via `renderResumeToHTML()` using `@react-pdf-renderer` or HTML string rendering.

### 2. HTML Templates

Custom HTML files with `{{placeholder}}` syntax. Stored as `htmlContent` in the template registry.

Rendered via `renderHtmlTemplateContent()` in `lib/resume/engine/renderResume.ts`.

Substitution variables:
```
{{fullName}} {{email}} {{phone}} {{location}} {{linkedin}} {{website}}
{{summary}} {{experience}} {{education}} {{skills}} {{certifications}} {{languages}}
```

Identified by `metadata.isHtmlTemplate === true` on the Resume row.

## The 24 Templates

### ATS-Safe
- `ats-pure` — ATS Pure (minimal, machine-readable)
- `ats-classic` — ATS Classic
- `ats-modern` — ATS Modern

### Classic
- `dubai-classic` — Dubai Classic (flagship, free)
- `uae-professional` — UAE Professional
- `uae-executive-classic` — UAE Executive Classic

### Modern
- `uae-tech` — UAE Tech (dark header, code-inspired)
- `uae-modern-pro` — UAE Modern Pro
- `uae-startup` — UAE Startup

### Creative
- `uae-creative` — UAE Creative (colorful)
- `uae-design` — UAE Design
- `uae-media` — UAE Media

### Finance / Executive
- `uae-banking` — UAE Banking (navy/gold)
- `uae-finance` — UAE Finance
- `uae-executive` — UAE Executive
- `uae-consulting` — UAE Consulting

### Premium
- `uae-gold` — UAE Gold (premium accent)
- `uae-platinum` — UAE Platinum
- `uae-luxury` — UAE Luxury

### Specialty
- `uae-hospitality` — UAE Hospitality
- `uae-healthcare` — UAE Healthcare
- `uae-engineering` — UAE Engineering
- `uae-government` — UAE Government
- `uae-education` — UAE Education

## Adding a New Template

1. Add entry to `lib/resume/templates/registry.ts`
2. Create `lib/resume/templates/<key>/Template.tsx` (React) or include HTML content directly in registry
3. Add to the hardcoded list in `app/templates/page.tsx` (the gallery)
4. Optionally add to `components/landing/TemplateShowcase.tsx` for homepage

## PDF Export Flow

```
User clicks Download PDF
  → POST /api/resumes/[id]/export
  → Loads resume data from DB
  → Checks metadata.isHtmlTemplate
    → YES: calls renderResumeToHTML(data, key, metadata.htmlContent)
           → renderHtmlTemplateContent() substitutes {{placeholders}}
           → Wraps in full HTML document
    → NO:  calls React component renderer
  → Puppeteer converts HTML → PDF buffer
  → Returns PDF as binary response
```

## Template Gallery Page

`app/templates/page.tsx` — all 24 templates hardcoded in the page.

Filters: All | ATS-Safe | Classic | Modern | Creative | Premium | Specialty | Minimal | Executive

Grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`

Badges: `Photo` shown for templates with `supportsPhoto: true` in registry.

## Homepage Showcase

`components/landing/TemplateShowcase.tsx` — shows 6 featured templates.

```typescript
const SHOWCASE_TEMPLATES = [
  { key: 'dubai-classic', ... },
  { key: 'uae-tech', ... },
  { key: 'uae-banking', ... },
  { key: 'uae-creative', ... },
  { key: 'uae-gold', ... },
  { key: 'ats-pure', ... },
]
```
