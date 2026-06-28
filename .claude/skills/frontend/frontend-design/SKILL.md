---
name: frontend-design
description: "Design lead producing distinctive, production-grade interfaces that avoid generic AI-generated aesthetics. Use when building new pages, redesigning UI, creating landing pages, or making visual design decisions for Career Pilot."
triggers: design, UI, visual, landing page, hero, layout, color, typography, page design, redesign, aesthetic, look and feel, branding
---

# Frontend Design — Career Pilot

Approach this as the design lead at a studio known for giving every client a visual identity that could not be mistaken for anyone else's. Career Pilot is a premium career development platform — the design must feel modern, clean, professional, and youth-friendly.

## Ground Every Design Decision

Before designing, establish:
1. What is the page's single job?
2. Who is the audience? (Career seekers, professionals, students)
3. What emotion should the user feel? (Confidence, clarity, momentum)

## Design Principles

**The hero is a thesis.** Open with the most important message. A big number with a small label and a gradient accent is the template answer — only use it if it's genuinely the best option.

**Typography carries personality.** Pair display and body faces deliberately. Set a clear type scale with intentional weights, widths, and spacing. Make the type treatment memorable, not a neutral delivery vehicle.

**Structure is information.** Numbered markers (01 / 02 / 03) are only appropriate if the content is actually a sequence. Question if structural choices encode something true about the content.

**Restraint over decoration.** Let one signature element be the memorable thing. Keep everything around it quiet and disciplined. Cut any decoration that does not serve the brief.

## Avoid AI-Slop Defaults

AI-generated design clusters around three looks — all legitimate for some briefs, but defaults rather than choices:
1. Warm cream background (#F4F1EA) with serif display and terracotta accent
2. Near-black background with acid-green or vermilion accent
3. Broadsheet layout with hairline rules and zero border-radius

Where the brief leaves an axis free, don't spend that freedom on these defaults.

## Process: Plan → Critique → Build → Critique

**First pass:** Create a compact design plan:
- **Palette:** 4-6 named hex values
- **Type:** Display face, body face, utility face
- **Layout:** ASCII wireframe or prose description
- **Signature:** The single unique element this page will be remembered by

**Second pass:** Review the plan. If any part reads like a generic default — revise it and say what changed and why. Only then build.

## Career Pilot Brand Standards

- Mobile-first: design for 375px first, then scale up
- Touch-friendly: minimum 44x44px tap targets
- Consistent spacing: use the existing Tailwind spacing scale
- Accessible: minimum 4.5:1 contrast ratio for text
- Performance: prefer CSS over JS for animations
- Responsive: test at 375px, 768px, 1024px, and desktop

## Writing in Design

Words are design material, not decoration. Write from the user's perspective:
- Name things by what people control, not how the system works
- Use active voice: "Save changes" not "Submit"
- Keep vocabulary consistent across the full flow
- Empty states are invitations to act, not apologies
- Errors explain what went wrong and how to fix it — no vague messages
