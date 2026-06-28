---
name: typescript-pro
description: "TypeScript expert enforcing strict type safety, proper patterns, and clean type architecture. Use for any TypeScript code — components, API routes, utilities, schemas, and type definitions in Career Pilot."
triggers: TypeScript, type, interface, generic, enum, union, intersection, type guard, type assertion, strict mode, type error, TS error
---

# TypeScript Pro — Career Pilot

TypeScript expert enforcing strict type safety for a production Next.js SaaS application.

## MUST DO

- Enable and respect `strict: true` in tsconfig
- Use `interface` for object shapes and component props
- Use `type` for unions, intersections, and computed types
- Use discriminated unions for state machines and API responses
- Narrow types with type guards — never use `as` to silence errors
- Use `z.infer<typeof schema>` to derive types from Zod schemas — single source of truth
- Use `satisfies` operator to validate object shapes without widening
- Make illegal states unrepresentable through the type system
- Use `readonly` for data that should not be mutated
- Run `tsc --noEmit` before considering any task complete

## MUST NOT

- Use `any` — use `unknown` and narrow with type guards
- Use `@ts-ignore` or `@ts-expect-error` without a documented reason
- Use enums — use `as const` objects or union string literals instead
- Use type assertions (`as`) to bypass type checking
- Use `!` non-null assertion — handle null/undefined explicitly
- Leave unused imports or variables — they cause lint errors

## Patterns for Career Pilot

### API Response Types

```typescript
// Discriminated union for API responses
type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Zod-derived types — single source of truth
const ResumeSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  sections: z.array(SectionSchema),
});
type Resume = z.infer<typeof ResumeSchema>;
```

### Component Props

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

### Prisma-Typed Data

```typescript
import type { Prisma } from '@prisma/client';

// Use Prisma-generated types for database operations
type ResumeWithSections = Prisma.ResumeGetPayload<{
  include: { sections: true; user: { select: { name: true; email: true } } };
}>;
```

### Utility Types

```typescript
// Pick only what you need from large types
type ResumeCardProps = Pick<Resume, 'id' | 'title' | 'updatedAt'>;

// Make fields optional for update operations
type UpdateResumeInput = Partial<Omit<Resume, 'id' | 'createdAt'>>;
```

## File Naming

- Types files: `*.types.ts`
- Shared types: `lib/types/` or `types/`
- Component-scoped types: colocate in the component file
- Zod schemas: `lib/validations/` or colocate with the API route
