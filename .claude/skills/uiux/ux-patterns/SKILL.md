---
name: ux-patterns
description: "UX pattern expert for SaaS career platforms — dashboards, forms, multi-step flows, data display, empty states, and onboarding. Use when designing user flows, improving UX, building feature interfaces, or solving usability issues in Career Pilot."
triggers: UX, user experience, user flow, onboarding, dashboard, form design, multi-step, wizard, empty state, loading state, error state, navigation, sidebar, modal, toast, notification
---

# UX Patterns — Career Pilot

UX specialist for SaaS career development platforms. Every pattern must serve the user's goal: discover career paths, build documents, prepare for interviews, and track progress.

## Core UX Principles

1. **Progressive disclosure** — show only what's needed now, reveal complexity as users advance
2. **Reduce cognitive load** — one primary action per screen, clear visual hierarchy
3. **Immediate feedback** — every action gets visible confirmation within 200ms
4. **Error prevention over error handling** — disable invalid actions, validate inline
5. **Mobile-first** — design for thumb-zone interaction on 375px screens first

## Dashboard Pattern

```
┌─────────────────────────────────────────┐
│ Greeting + Quick Stats (3-4 cards)      │
├─────────────────────────────────────────┤
│ Recent Activity Feed                    │
├──────────────────┬──────────────────────┤
│ Quick Actions    │ Progress/Goals       │
│ (Resume, Letter) │ (Career roadmap)     │
└──────────────────┴──────────────────────┘
```

- Greeting is personalized: "Good morning, [Name]"
- Stats cards show: Resumes created, Applications tracked, Interview score, Skill progress
- Quick actions: max 3-4 primary CTAs
- Recent activity: last 5 items with relative timestamps

## Multi-Step Flow (Resume Builder, Interview Prep)

- Show progress bar with labeled steps
- Allow backward navigation without data loss
- Save progress automatically (not just on submit)
- Validate each step before allowing advancement
- Show summary/review before final submission
- Mobile: stack steps vertically, collapse progress to step count

```
Step 1 of 5: Personal Info
[==========          ] 40%
```

## Form Patterns

- Labels above inputs (not floating labels — better for a11y)
- Inline validation on blur (not on every keystroke)
- Error messages appear below the field, in red with an icon
- Group related fields with fieldsets and visual sections
- Optional fields marked "(optional)" — not required fields marked with asterisks
- Submit button text describes the action: "Create Resume" not "Submit"
- Disable submit during processing, show spinner

## Empty States

Every list/collection needs an empty state that:
1. Explains what will appear here
2. Shows a relevant illustration or icon
3. Provides one clear CTA to get started

```
┌─────────────────────────────────┐
│         📄 (illustration)       │
│                                 │
│   No resumes yet               │
│   Create your first resume     │
│   to get started               │
│                                 │
│   [ Create Resume ]            │
└─────────────────────────────────┘
```

## Loading States

- Skeleton screens for initial page loads (not spinners)
- Inline spinners for button actions
- Progress bars for file uploads or long AI operations
- Optimistic updates for fast-feeling CRUD operations
- Loading text for AI-powered features: "Analyzing your resume..." with animation

## Error States

- Inline field errors: appear on blur, disappear when fixed
- Toast notifications: for transient errors (network issues)
- Full-page errors: only for unrecoverable situations (500s)
- Retry button for failed network requests
- Never show raw error codes or stack traces

## Navigation

- Top navbar for primary navigation (desktop)
- Bottom tab bar for mobile primary navigation
- Sidebar for admin/dashboard secondary navigation
- Breadcrumbs for nested content (Resume > Section > Edit)
- Active state clearly visible on current page link

## Modal/Dialog Rules

- Use for confirmations, quick edits, previews
- Never for complex multi-step flows (use a full page instead)
- Close on Escape key and overlay click
- Trap focus inside the modal
- Return focus to trigger element on close
- Max width: 500px for simple, 700px for content-heavy

## Toast/Notification Pattern

- Position: top-right on desktop, top-center on mobile
- Auto-dismiss after 5 seconds (except errors)
- Success: green, briefly confirms the action
- Error: red, stays until dismissed, explains what to do
- Warning: yellow, for non-blocking issues
- Max 3 visible toasts at once
