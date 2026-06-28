---
name: accessibility
description: "WCAG 2.1 AA accessibility expert for auditing and fixing a11y issues. Use when building forms, interactive components, navigation, modals, or when auditing any user-facing page in Career Pilot."
triggers: accessibility, a11y, WCAG, screen reader, keyboard navigation, ARIA, focus, contrast, alt text, semantic HTML, tab order, skip link
---

# Accessibility — Career Pilot

WCAG 2.1 AA compliance specialist ensuring Career Pilot is usable by everyone.

## Core Audit Checklist

### Perceivable
- [ ] All images have meaningful `alt` text (or `alt=""` for decorative)
- [ ] Color contrast ratio meets 4.5:1 for normal text, 3:1 for large text
- [ ] Information is not conveyed by color alone
- [ ] Text can be resized to 200% without loss of content
- [ ] Form inputs have visible labels (not just placeholders)

### Operable
- [ ] All interactive elements are keyboard accessible
- [ ] Visible focus indicators on all focusable elements
- [ ] No keyboard traps — users can tab in and out of all components
- [ ] Skip navigation link present on pages with repeated navigation
- [ ] Touch targets are minimum 44x44px on mobile
- [ ] Animations respect `prefers-reduced-motion`

### Understandable
- [ ] Page language is set (`<html lang="en">`)
- [ ] Form errors are clearly identified and described
- [ ] Labels and instructions are provided for user input
- [ ] Navigation is consistent across pages
- [ ] Error messages explain what went wrong and how to fix it

### Robust
- [ ] Valid semantic HTML structure
- [ ] ARIA attributes used correctly (prefer native HTML first)
- [ ] Custom components have appropriate ARIA roles
- [ ] Page works without JavaScript for critical content

## MUST DO

- Use semantic HTML first: `<button>`, `<nav>`, `<main>`, `<header>`, `<form>`, `<label>`
- Associate labels with inputs using `htmlFor` / `id`
- Use `aria-live="polite"` for dynamic content updates (notifications, loading states)
- Add `role="alert"` to error messages
- Implement focus management for modals and dialogs (trap focus, return focus on close)
- Test keyboard navigation: Tab, Shift+Tab, Enter, Space, Escape, Arrow keys
- Use heading hierarchy: one `<h1>` per page, no skipped levels

## MUST NOT

- Use `<div>` or `<span>` for clickable elements — use `<button>` or `<a>`
- Remove focus outlines without providing an alternative visible indicator
- Use `aria-label` on elements that already have visible text
- Auto-play audio or video without user control
- Create content that flashes more than 3 times per second
- Use title attributes as the sole means of conveying information

## Career Pilot Specific

### Forms (Resume builder, Cover letter, Interview prep)
```tsx
// Always pair label + input
<label htmlFor="job-title" className="text-sm font-medium">
  Job Title
</label>
<input id="job-title" aria-describedby="job-title-error" />
{error && <p id="job-title-error" role="alert" className="text-sm text-red-600">{error}</p>}
```

### Loading States
```tsx
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? <Spinner aria-label="Loading resume data" /> : <ResumeContent />}
</div>
```

### Modals and Dialogs
```tsx
// Trap focus, close on Escape, return focus to trigger
<dialog aria-labelledby="dialog-title" aria-modal="true">
  <h2 id="dialog-title">Confirm Delete</h2>
  {/* focusable content */}
</dialog>
```
