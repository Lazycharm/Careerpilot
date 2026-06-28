---
name: architecture-designer
description: "System architecture designer for planning multi-file features, module structure, and data flow. Use when planning new features, refactoring existing systems, or making architectural decisions that span multiple files in Career Pilot."
triggers: architecture, system design, module structure, data flow, feature planning, refactor, restructure, folder structure, separation of concerns, scalability
---

# Architecture Designer — Career Pilot

System architect for a Next.js 14 SaaS application, planning scalable feature implementations that span multiple files and layers.

## Career Pilot Architecture

```
app/                    # Next.js App Router — pages and API routes
  (landing)/            # Public marketing pages (route group)
  auth/                 # Authentication pages
  dashboard/            # Protected user dashboard
  resume/               # Resume builder feature
  cover-letter/         # Cover letter feature
  interview/            # Interview prep feature
  admin/                # Admin panel (role-protected)
  api/                  # API Route Handlers
    auth/               # Auth endpoints
    ai/                 # AI-powered endpoints
    resumes/            # Resume CRUD
    cover-letters/      # Cover letter CRUD
    interviews/         # Interview CRUD
    payments/           # Payment processing
    admin/              # Admin-only endpoints
    subscription/       # Subscription management

components/
  ui/                   # Primitive UI components (button, input, card)
  shared/               # Shared layout components (navbar, activity)
  resume/               # Resume-specific components
  seo/                  # SEO components

lib/                    # Shared utilities and config
  auth.ts               # NextAuth configuration
  prisma.ts             # Prisma client singleton
  utils.ts              # cn() and general utilities
  validations/          # Zod schemas

prisma/
  schema.prisma         # Database schema
  migrations/           # Migration files
```

## Feature Design Template

When planning a new feature, define:

### 1. Data Model
- What Prisma models are needed?
- Relations to existing models?
- What indexes are required?

### 2. API Layer
- Which endpoints (method + path)?
- Request/response schemas (Zod)?
- Authentication and authorization requirements?
- Rate limiting needed?

### 3. UI Layer
- Which pages/routes?
- Server vs Client components?
- Shared components to build?
- Loading/error/empty states?

### 4. Business Logic
- Where does complex logic live? (API route vs lib/ utility)
- Validation rules?
- AI integration points?

### 5. Testing Strategy
- Which Vitest unit tests?
- Which Playwright E2E flows?

## Architectural Rules

### Separation of Concerns
- **Pages** (`app/*/page.tsx`): layout composition, data fetching (server components)
- **Components** (`components/`): UI rendering, user interaction
- **API Routes** (`app/api/`): request handling, validation, auth checks
- **Lib** (`lib/`): business logic, utilities, configuration
- **Prisma** (`prisma/`): data modeling, migrations

### Data Flow
```
User Action → Client Component → API Route → Validation → Auth Check → Business Logic → Prisma → Database
                                                                                           ↓
User Sees ← Client Component ← Server Component ← ← ← ← ← ← ← ← ← ← ← ← ← Response
```

### File Size Limits
- Components: under 200 lines (split into subcomponents)
- API routes: under 100 lines per handler (extract logic to lib/)
- Pages: under 150 lines (compose from components)
- Utility files: under 300 lines

### When to Extract
- Same code appears in 3+ places → extract to `lib/` or shared component
- API handler exceeds 50 lines of business logic → extract to `lib/services/`
- Component has 3+ visual variants → use CVA
- Form validation schema shared between frontend and API → put in `lib/validations/`
