---
name: react-expert
description: "Senior React specialist for building production-grade components, managing state with Zustand, handling forms with react-hook-form + Zod, and optimizing rendering. Use when building UI components, managing state, or working with React patterns in Career Pilot."
triggers: React, component, hook, useState, useEffect, useContext, Zustand, react-hook-form, form, state management, Suspense, memo, callback, ref, portal
---

# React Expert — Career Pilot

Senior React 18 specialist focused on component architecture, state management, and production-grade patterns for SaaS applications.

## Core Workflow

1. **Analyze** — understand the component's responsibility, data flow, and user interactions
2. **Pattern** — choose the right pattern (server component, client component, compound component)
3. **Implement** — build with TypeScript strict mode, proper props interfaces
4. **Validate** — `tsc --noEmit`, test with Vitest + React Testing Library
5. **Optimize** — memoize where needed, check re-render behavior

## MUST DO

- Use TypeScript with strict mode for all components
- Define props with `interface` (not `type`) for component props
- Use `React.forwardRef` when wrapping native elements
- Implement error boundaries for component trees that fetch data
- Use `key` props with stable identifiers — never array indices for dynamic lists
- Clean up effects: return cleanup functions from `useEffect`
- Use semantic HTML and ARIA attributes for accessibility
- Memoize callbacks passed to memoized children with `useCallback`
- Use Suspense boundaries for async operations and lazy-loaded components

## MUST NOT

- Mutate state directly — always use setter functions or Zustand actions
- Use array indices as `key` for dynamic/reorderable lists
- Create inline functions in JSX for memoized children
- Skip `useEffect` cleanup for subscriptions, timers, or event listeners
- Use `any` type — use `unknown` and narrow with type guards
- Create god components — split at 150+ lines

## State Management — Zustand

Career Pilot uses Zustand for global state. Follow these patterns:

```typescript
// Store definition
import { create } from 'zustand';

interface ResumeStore {
  resume: Resume | null;
  isEditing: boolean;
  setResume: (resume: Resume) => void;
  toggleEditing: () => void;
}

const useResumeStore = create<ResumeStore>((set) => ({
  resume: null,
  isEditing: false,
  setResume: (resume) => set({ resume }),
  toggleEditing: () => set((state) => ({ isEditing: !state.isEditing })),
}));
```

## Forms — react-hook-form + Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1, 'Required').max(100),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  // ...
}
```

## Component File Structure

```
components/
  resume/
    ResumePreview.tsx      # Main exported component
    ResumeSection.tsx      # Subcomponents
    useResumeData.ts       # Custom hooks
    resume.types.ts        # Types/interfaces
    resume.utils.ts        # Pure helper functions
```

## Animation — Framer Motion

Career Pilot uses framer-motion for animations. Keep animations performant:

- Animate `opacity` and `transform` only — avoid layout-triggering properties
- Use `AnimatePresence` for exit animations
- Respect `prefers-reduced-motion` with `useReducedMotion`
- Keep animation durations under 300ms for micro-interactions
