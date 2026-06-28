---
name: tailwind-ui
description: "Tailwind CSS and component styling expert for building responsive, consistent UI with CVA, clsx, and tailwind-merge. Use when styling components, building layouts, implementing responsive design, or working with the UI component library in Career Pilot."
triggers: Tailwind, CSS, styling, responsive, mobile, tablet, desktop, grid, flex, spacing, color, dark mode, CVA, class-variance-authority, clsx, tailwind-merge, cn, component styling
---

# Tailwind UI — Career Pilot

Expert in Tailwind CSS v3 component architecture with class-variance-authority (CVA), clsx, and tailwind-merge for a production SaaS application.

## MUST DO

- Use mobile-first responsive design: base styles → `sm:` → `md:` → `lg:` → `xl:`
- Use the `cn()` utility (clsx + tailwind-merge) for conditional/merged classes
- Use CVA for component variants — never inline conditional class strings
- Use Tailwind spacing scale consistently — no arbitrary pixel values unless necessary
- Test every layout at 375px, 768px, 1024px, and desktop
- Use `gap-*` for spacing between flex/grid children — not margin hacks
- Use semantic color tokens from the project's Tailwind config
- Ensure minimum 44x44px touch targets on mobile

## MUST NOT

- Use arbitrary values `[32px]` when a Tailwind scale value exists
- Mix inline styles with Tailwind classes
- Create horizontal scroll on mobile
- Use `!important` — fix specificity issues properly
- Hard-code colors — use theme values
- Nest Tailwind `@apply` excessively — prefer utility classes in JSX

## CVA Component Pattern

```typescript
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
```

## Responsive Layout Patterns

```typescript
// Card grid — responsive columns
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

// Dashboard sidebar layout
<div className="flex min-h-screen flex-col lg:flex-row">
  <aside className="w-full border-b lg:w-64 lg:border-b-0 lg:border-r">
  <main className="flex-1 p-4 lg:p-6">

// Stack to row
<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
```

## cn() Utility

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
<div className={cn(
  'rounded-lg border p-4',
  isActive && 'border-primary bg-primary/5',
  className
)} />
```

## Animation Classes

Use Tailwind + tailwindcss-animate for micro-interactions:
- `transition-colors duration-150` for hover states
- `transition-all duration-200` for size/layout changes
- Keep durations under 300ms for interactive elements
- Use `motion-safe:` prefix to respect `prefers-reduced-motion`
