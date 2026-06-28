---
name: auth-patterns
description: "NextAuth.js authentication and authorization expert for session handling, role-based access, route protection, and OAuth flows. Use when working with auth, sessions, roles, permissions, or protected routes in Career Pilot."
triggers: auth, authentication, authorization, NextAuth, session, login, register, password, role, permission, admin, protected route, middleware, OAuth, Google OAuth, JWT, session handling
---

# Auth Patterns — Career Pilot

Authentication and authorization specialist for NextAuth.js v4 in a production SaaS platform with role-based access control.

## Architecture

- **Provider**: NextAuth.js v4 with credentials + Google OAuth
- **Session Strategy**: JWT-based sessions
- **Password Hashing**: bcryptjs (minimum 10 salt rounds)
- **Roles**: `USER`, `ADMIN` (stored in database, included in session)
- **Route Protection**: middleware + server-side session checks

## MUST DO

- Hash passwords with `bcryptjs` — minimum 10 salt rounds
- Check session on every protected API route with `getServerSession(authOptions)`
- Include user role in the JWT/session via NextAuth callbacks
- Use middleware for route-level protection (redirect unauthenticated users)
- Validate email format and password strength on registration
- Rate limit authentication endpoints (login, register, forgot-password)
- Use constant-time comparison for password verification (bcrypt does this)
- Log authentication events (login, failed login, password reset)
- Return generic error messages: "Invalid credentials" — never reveal which field is wrong

## MUST NOT

- Store passwords in plaintext or reversible encryption
- Expose whether an email exists in error messages ("user not found" vs "invalid credentials")
- Trust client-side role checks — always verify server-side
- Store tokens or secrets in client-side code or localStorage
- Skip CSRF protection on auth endpoints
- Allow unlimited login attempts without rate limiting
- Return different error messages for wrong email vs wrong password

## Route Protection

### Middleware (route-level)
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ['/dashboard/:path*', '/resume/:path*', '/interview/:path*', '/cover-letter/:path*'],
};
```

### API Route (handler-level)
```typescript
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... handler logic with session.user.id for ownership checks
}
```

### Admin Protection
```typescript
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // ... admin-only logic
}
```

## NextAuth Configuration Pattern

```typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user?.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
```

## Password Registration

```typescript
const SALT_ROUNDS = 12;

async function registerUser(email: string, password: string, name: string) {
  // Validate password strength
  if (password.length < 8) throw new Error('Password too short');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  return prisma.user.create({
    data: { email: email.toLowerCase().trim(), passwordHash, name },
  });
}
```
