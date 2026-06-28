---
name: ux-writing
description: "UX writing and microcopy expert for user-facing text — buttons, labels, errors, empty states, onboarding, tooltips, and notifications. Use when writing or reviewing any text that users see in Career Pilot."
triggers: copy, wording, text, label, button text, error message, empty state text, tooltip, placeholder, onboarding text, notification text, toast message, confirmation, help text, microcopy
---

# UX Writing — Career Pilot

UX writing specialist producing clear, confidence-building microcopy for a career development platform. Every word should help users feel capable and guided, never confused or talked down to.

## Voice & Tone

**Career Pilot's voice is:**
- **Clear** — say exactly what's happening, no jargon
- **Encouraging** — users are building their careers, celebrate progress
- **Professional** — trustworthy, competent, not overly casual
- **Direct** — active voice, short sentences, specific actions

**Tone shifts by context:**
| Context | Tone | Example |
|---------|------|---------|
| Success | Warm, congratulatory | "Resume saved. Looking sharp!" |
| Error | Calm, helpful | "We couldn't save your changes. Check your connection and try again." |
| Empty state | Inviting, action-oriented | "No resumes yet. Create your first one to get started." |
| Onboarding | Welcoming, guiding | "Welcome to Career Pilot. Let's set up your profile." |
| Confirmation | Clear, specific | "Delete this resume? This can't be undone." |
| Loading (AI) | Transparent, interesting | "Analyzing your experience..." |

## Writing Rules

### Buttons & Actions
- Use verbs that describe the outcome: "Create Resume" not "Submit"
- Keep to 2-3 words maximum
- Match the button text to the result: if button says "Save", toast says "Saved"
- Destructive actions: use specific language — "Delete Resume" not "Delete"

| Instead of | Write |
|------------|-------|
| Submit | Create Resume |
| Cancel | Never mind |
| OK | Got it |
| Click here | [specific action] |
| N/A | — (dash) or leave blank |

### Form Labels & Placeholders
- Labels describe the field: "Job Title", "Company Name"
- Placeholders show format or example: "e.g., Software Engineer"
- Help text explains why: "We'll use this to tailor recommendations"
- Never use placeholder as label

### Error Messages
Formula: **What happened** + **What to do**
- "Email is already registered. Try signing in instead."
- "Password must be at least 8 characters."
- "We couldn't reach our servers. Check your connection and try again."

Never:
- "Invalid input" (too vague)
- "Error 500" (meaningless to users)
- "Oops! Something went wrong!" (unprofessional)

### Empty States
Formula: **What goes here** + **Why it matters** + **CTA**
- "No cover letters yet. A tailored cover letter can boost your chances. Create one now."
- "Your interview history will appear here once you complete a practice session."

### Loading & Progress
- AI operations: describe what's happening — "Reviewing your experience...", "Crafting suggestions..."
- Data loading: use skeleton screens, not text
- Long operations: show progress — "Generating PDF (2 of 3 pages)..."

### Confirmation Dialogs
Formula: **What will happen** + **Is it reversible?** + **Specific action button**
```
Delete "Software Engineer Resume"?
This will permanently remove the resume and all its sections.

[Cancel]  [Delete Resume]
```

### Notifications & Toasts
- Success: past tense — "Resume saved", "Cover letter created"
- Error: present tense + action — "Couldn't save. Try again."
- Info: present tense — "Your subscription renews on March 15"

## Career-Specific Language

| Instead of | Write | Why |
|------------|-------|-----|
| User | You / Your | Personal, direct |
| Utilize | Use | Simpler |
| Leverage | Use / Build on | Less corporate |
| Synergy | Connection / Fit | Clearer |
| Monetize | Earn from | Human |
| Optimize | Improve / Strengthen | Approachable |

## Checklist Before Shipping

- [ ] Every button says what it does
- [ ] Every form field has a visible label
- [ ] Every error message says what went wrong AND what to do
- [ ] Every empty state has a CTA
- [ ] No placeholder-only labels
- [ ] No "Click here" links
- [ ] No raw error codes shown to users
- [ ] Consistent terminology (same feature, same name everywhere)
- [ ] Spelling and grammar checked
