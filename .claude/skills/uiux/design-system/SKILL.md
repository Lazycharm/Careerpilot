---
name: design-system
description: "Design system architect for maintaining consistent UI components, tokens, and patterns across Career Pilot. Use when building or auditing shared components, establishing patterns, or checking UI consistency."
triggers: design system, component library, design tokens, spacing, typography scale, color system, button, card, input, badge, alert, consistent, reusable, shared component
---

# Design System — Career Pilot

Design system architect maintaining visual consistency, reusable components, and design tokens for the Career Pilot platform.

## Component Inventory

Career Pilot's component library lives in `components/ui/` and `components/shared/`:

### Primitives (`components/ui/`)
- `button.tsx` — primary, secondary, ghost, destructive variants
- `input.tsx` — text input with label, error, and description support
- `textarea.tsx` — multi-line input
- `label.tsx` — form labels
- `card.tsx` — content container with header, body, footer
- `badge.tsx` — status indicators, tags
- `alert.tsx` — informational banners

### Shared (`components/shared/`)
- `Navbar.tsx` — top navigation
- `AnimatedCounter.tsx` — number animations
- `NotificationBell.tsx` — notification indicator
- `RecentActivity.tsx` — activity feed

## Design Tokens

### Spacing Scale (Tailwind)
Use the Tailwind spacing scale consistently. Common values:
- `gap-1` (4px): tight inline spacing
- `gap-2` (8px): between related elements
- `gap-4` (16px): between sections within a card
- `gap-6` (24px): between cards or major sections
- `gap-8` (32px): page-level section spacing
- `p-4` (16px): card padding (mobile)
- `p-6` (24px): card padding (desktop)

### Typography Scale
- Page title: `text-2xl font-bold` (mobile) / `text-3xl font-bold` (desktop)
- Section heading: `text-xl font-semibold`
- Card title: `text-lg font-semibold`
- Body text: `text-base` (16px)
- Small text: `text-sm` (14px)
- Caption: `text-xs text-muted-foreground` (12px)

### Border Radius
- Buttons: `rounded-md`
- Cards: `rounded-lg`
- Badges: `rounded-full`
- Inputs: `rounded-md`
- Modals: `rounded-lg`

## Component Rules

### When to Create a New Component
1. The pattern appears 3+ times across different features
2. It has clear, stable props interface
3. It's visually distinct enough to warrant extraction

### Component Structure
```typescript
// components/ui/component-name.tsx
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const componentVariants = cva('base-classes', {
  variants: { /* ... */ },
  defaultVariants: { /* ... */ },
});

interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {
  // additional props
}

export function Component({ className, variant, ...props }: ComponentProps) {
  return <element className={cn(componentVariants({ variant }), className)} {...props} />;
}
```

### Component Checklist
- [ ] Uses CVA for variants
- [ ] Accepts `className` prop for composition
- [ ] Has TypeScript interface for props
- [ ] Forwards refs where needed
- [ ] Accessible (keyboard, screen reader, contrast)
- [ ] Responsive (tested at 375px, 768px, desktop)
- [ ] Uses design tokens (not hard-coded values)

## Visual Consistency Audit

When building or reviewing UI, check:
1. **Spacing** — consistent with the scale above
2. **Typography** — follows the type scale
3. **Colors** — uses theme tokens, not hex values
4. **Border radius** — matches component type
5. **Shadows** — consistent depth: `shadow-sm` for elevated elements
6. **Transitions** — `transition-colors duration-150` for interactive elements
7. **Focus states** — visible ring on all interactive elements
