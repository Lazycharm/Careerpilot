---
name: prisma-postgres
description: "Prisma ORM and PostgreSQL expert for schema design, migrations, query optimization, and data modeling. Use when working with the database layer, writing migrations, optimizing queries, or designing data models in Career Pilot."
triggers: Prisma, database, migration, schema, model, query, relation, index, PostgreSQL, SQL, seed, transaction, include, select, where, findMany, findUnique, create, update, delete, upsert
---

# Prisma + PostgreSQL — Career Pilot

Database architect specializing in Prisma ORM with PostgreSQL for a production SaaS application with user accounts, resumes, cover letters, interviews, subscriptions, and payments.

## Core Workflow

1. **Model** — design the schema with proper relations, constraints, and indexes
2. **Migrate** — `prisma migrate dev --name descriptive_name` (never `db push` in this project)
3. **Generate** — `prisma generate` after schema changes
4. **Query** — use Prisma Client with proper select/include, pagination, and error handling
5. **Optimize** — add indexes for frequent queries, use `select` to avoid over-fetching

## MUST DO

- Use `prisma migrate dev` for schema changes — `db:push` is forbidden in this project
- Name migrations descriptively: `add_cover_letter_model`, `add_index_on_resume_user_id`
- Add `@@index` on foreign keys and frequently filtered/sorted columns
- Use `select` to fetch only needed fields — avoid fetching entire rows
- Use transactions for multi-step operations: `prisma.$transaction()`
- Always include `userId` in queries as ownership filter
- Use soft deletes where appropriate (add `deletedAt DateTime?`)
- Handle `PrismaClientKnownRequestError` for constraint violations (P2002 unique, P2025 not found)

## MUST NOT

- Use `db push` — it's blocked in this project (see `package.json`)
- Use raw SQL unless Prisma cannot express the query
- Fetch relations you don't need — use `select` and `include` precisely
- Skip indexes on foreign keys — they're not automatic in PostgreSQL
- Create N+1 queries — use `include` or batch queries instead
- Store sensitive data (passwords, tokens) without hashing
- Use cascade deletes without understanding the full impact

## Schema Design Patterns

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  passwordHash  String
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  resumes       Resume[]
  coverLetters  CoverLetter[]
  interviews    Interview[]
  subscription  Subscription?

  @@index([email])
}

enum Role {
  USER
  ADMIN
}
```

## Query Patterns

```typescript
// Fetch with ownership check + select only needed fields
const resume = await prisma.resume.findFirst({
  where: { id: resumeId, userId: session.user.id },
  select: { id: true, title: true, sections: true, updatedAt: true },
});

// Paginated list
const resumes = await prisma.resume.findMany({
  where: { userId: session.user.id },
  orderBy: { updatedAt: 'desc' },
  take: 10,
  skip: page * 10,
  select: { id: true, title: true, updatedAt: true },
});

// Transaction for multi-step operations
const result = await prisma.$transaction(async (tx) => {
  const resume = await tx.resume.create({ data: resumeData });
  await tx.activity.create({ data: { userId, type: 'RESUME_CREATED', resourceId: resume.id } });
  return resume;
});
```

## Error Handling

```typescript
import { Prisma } from '@prisma/client';

try {
  await prisma.user.create({ data });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    if (error.code === 'P2025') {
      // Record not found
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }
  throw error;
}
```

## Performance Checklist

- [ ] Foreign key columns have `@@index`
- [ ] Frequently filtered columns have indexes
- [ ] `select` used instead of fetching full rows
- [ ] No N+1 queries (check for loops with individual queries)
- [ ] Pagination implemented for list endpoints
- [ ] Connection pooling configured for production
