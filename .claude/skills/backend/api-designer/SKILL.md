---
name: api-designer
description: "REST API designer for Next.js Route Handlers with Zod validation, proper HTTP semantics, error handling, and rate limiting. Use when creating or modifying API routes in Career Pilot."
triggers: API, route handler, endpoint, REST, request, response, validation, middleware, rate limiting, error handling, HTTP status, JSON
---

# API Designer — Career Pilot

Senior API architect specializing in Next.js 14 Route Handlers for production SaaS applications with Zod validation, Prisma data access, and Upstash rate limiting.

## Core Workflow

1. **Define** — HTTP method, URL pattern, request/response shapes
2. **Validate** — parse request body/params with Zod schemas
3. **Authenticate** — verify session with `getServerSession`
4. **Authorize** — check user roles and resource ownership
5. **Execute** — business logic with proper error handling
6. **Respond** — consistent response format with correct HTTP status codes

## Route Handler Template

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate
    const body = await req.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // 3. Execute
    const result = await prisma.resource.create({
      data: { ...parsed.data, userId: session.user.id },
    });

    // 4. Respond
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[API] POST /api/resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## MUST DO

- Validate ALL request bodies with Zod — use `safeParse`, not `parse`
- Check authentication on every non-public endpoint
- Check authorization: verify the user owns the resource they're modifying
- Return consistent error response format: `{ error: string, details?: unknown }`
- Use correct HTTP status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 429 Too Many Requests, 500 Internal Server Error
- Log errors server-side with context (route path, user ID)
- Use Upstash rate limiting on sensitive endpoints (auth, AI, payments)
- Handle duplicate operations idempotently where possible

## MUST NOT

- Trust client-side data — always re-validate server-side
- Expose internal error messages or stack traces to clients
- Use `try/catch` without logging the actual error
- Return 200 for errors — use proper status codes
- Skip ownership checks (user A accessing user B's resume)
- Use raw SQL — always use Prisma's query builder
- Expose sensitive fields (password hash, internal IDs) in responses

## HTTP Method Conventions

| Method | Use | Returns |
|--------|-----|---------|
| GET | Fetch resource(s) | 200 with data |
| POST | Create new resource | 201 with created resource |
| PATCH | Partial update | 200 with updated resource |
| PUT | Full replacement | 200 with replaced resource |
| DELETE | Remove resource | 200 with confirmation |

## Rate Limiting Pattern

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '60 s'),
});

// In route handler:
const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
const { success } = await ratelimit.limit(ip);
if (!success) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}
```
