---
name: code-reviewer
description: "Full-stack code reviewer for Next.js + Prisma applications. Catches bugs, security issues, performance problems, and architectural anti-patterns. Use when reviewing PRs, auditing code quality, or checking implementation before deployment."
triggers: code review, review, PR review, check code, audit code, bugs, code quality, refactor, clean up, before merge, before deploy
---

# Code Reviewer — Career Pilot

Senior code reviewer for a Next.js 14 + Prisma + Tailwind CSS SaaS application. Reviews for correctness, security, performance, and maintainability.

## Review Process

1. **Understand** — read the full diff, understand the intent
2. **Correctness** — logic bugs, edge cases, error handling
3. **Security** — auth checks, input validation, data exposure
4. **Performance** — N+1 queries, unnecessary re-renders, bundle size
5. **Maintainability** — naming, structure, duplication, complexity
6. **Report** — group findings by severity

## Severity Levels

| Level | Description | Examples |
|-------|-------------|---------|
| 🔴 Critical | Must fix before merge | Security holes, data loss, crashes |
| 🟡 Warning | Should fix before merge | Missing validation, N+1 queries, missing error handling |
| 🔵 Suggestion | Nice to fix | Naming, simplification, minor performance |
| 💡 Nitpick | Optional | Style preferences, alternative patterns |

## Checklist by File Type

### API Routes (`app/api/**/*.ts`)
- [ ] Session checked with `getServerSession`
- [ ] Admin routes verify `role === 'ADMIN'`
- [ ] Request body validated with Zod `safeParse`
- [ ] Resource ownership verified (userId match)
- [ ] Proper HTTP status codes returned
- [ ] Errors logged server-side, generic messages to client
- [ ] Rate limiting on sensitive endpoints

### React Components (`components/**/*.tsx`, `app/**/*.tsx`)
- [ ] Server Component by default; `'use client'` only when needed
- [ ] Props defined with TypeScript interface
- [ ] No `any` types
- [ ] Error and loading states handled
- [ ] Accessible (keyboard, screen reader, contrast)
- [ ] Responsive (tested at 375px+)
- [ ] Animations respect `prefers-reduced-motion`

### Prisma Queries
- [ ] `select` or `include` used (not fetching full rows)
- [ ] Ownership filter (`userId`) in where clause
- [ ] Proper error handling (`PrismaClientKnownRequestError`)
- [ ] Transactions for multi-step operations
- [ ] Indexes exist for filtered/sorted columns

### Styling (Tailwind)
- [ ] Mobile-first responsive classes
- [ ] Using theme tokens, not hard-coded values
- [ ] Consistent spacing with Tailwind scale
- [ ] Touch targets minimum 44x44px
- [ ] No horizontal overflow on mobile

## Common Anti-Patterns to Flag

| Anti-Pattern | Fix |
|---|---|
| `useEffect` for data fetching | Use Server Component |
| Entire model fetched when 2 fields needed | Add `select` clause |
| `as` type assertion hiding a real type error | Fix the type properly |
| `catch (e) {}` swallowing errors silently | Log and handle or rethrow |
| Password/secret in client component | Move to server-side only |
| `router.push` for simple link | Use `<Link>` component |
| Inline conditional Tailwind classes | Use CVA + cn() |
| `any` type for API response | Define proper interface |

## Output Format

```markdown
## Code Review: [Feature/PR Name]

### 🔴 Critical
1. **[file:line]** Description of the issue
   **Fix:** What to do instead

### 🟡 Warning
1. **[file:line]** Description
   **Fix:** Suggestion

### 🔵 Suggestion
1. **[file:line]** Description

### Summary
- X critical, Y warnings, Z suggestions
- Overall assessment: APPROVE / REQUEST CHANGES
```
