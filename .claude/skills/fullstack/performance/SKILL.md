---
name: performance
description: "Web performance optimization expert for Core Web Vitals, bundle size, rendering, and database query performance. Use when optimizing page speed, fixing slow pages, reducing bundle size, or improving LCP/CLS/FID in Career Pilot."
triggers: performance, slow, speed, Core Web Vitals, LCP, CLS, FID, INP, bundle size, lazy loading, code splitting, caching, optimize, lighthouse, web vitals
---

# Performance — Career Pilot

Performance engineer optimizing a Next.js 14 SaaS application for Core Web Vitals and perceived speed.

## Core Web Vitals Targets

| Metric | Target | What It Measures |
|--------|--------|-----------------|
| LCP | < 2.5s | Largest Contentful Paint — how fast the main content loads |
| FID/INP | < 100ms | Interaction to Next Paint — responsiveness to user input |
| CLS | < 0.1 | Cumulative Layout Shift — visual stability |

## Quick Wins Checklist

### Images
- [ ] Use `next/image` with `width`, `height`, or `fill` (prevents CLS)
- [ ] Use WebP format (configure in `next.config.js`)
- [ ] Add `priority` to above-the-fold images (improves LCP)
- [ ] Use `loading="lazy"` for below-the-fold images (default in next/image)
- [ ] Set `sizes` attribute for responsive images

### Fonts
- [ ] Use `next/font` for self-hosted fonts (eliminates FOUT/FOIT)
- [ ] Preload critical fonts with `display: 'swap'`
- [ ] Limit font weights/styles to what's actually used

### JavaScript
- [ ] Server Components by default (zero client JS)
- [ ] `'use client'` only on interactive leaf components
- [ ] Dynamic import for non-critical components: `dynamic(() => import(...))`
- [ ] Code split heavy libraries (PDF renderer, chart libraries)
- [ ] No unused imports or dead code

### CSS
- [ ] Tailwind purges unused styles automatically
- [ ] No large external CSS files
- [ ] Use `content-visibility: auto` for long scrollable sections

## Rendering Strategy

| Page Type | Strategy | Why |
|-----------|----------|-----|
| Landing page | Static (SSG) | Rarely changes, fast LCP |
| Dashboard | Server Component | Fresh data, no client JS needed |
| Resume editor | Client Component | Interactive, needs state |
| Admin panel | Server Component | Data-heavy, role-protected |
| API docs/help | Static (SSG) | Never changes |

## Database Performance

- Use `select` to fetch only needed columns
- Add `@@index` on filtered/sorted columns
- Paginate all list queries (max 20 per page)
- Cache expensive queries with `unstable_cache` or ISR
- Watch for N+1: use `include` instead of sequential queries
- Use `prisma.$transaction` for multi-step operations (connection reuse)

## Bundle Size

```typescript
// Dynamic import for heavy components
const PDFPreview = dynamic(() => import('@/components/resume/PDFPreviewDialog'), {
  loading: () => <Skeleton className="h-96" />,
  ssr: false,
});

// Lazy load framer-motion features
const MotionDiv = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.div),
  { ssr: false }
);
```

## Caching Strategy

| Resource | Cache Strategy |
|----------|---------------|
| Static pages | Build-time generation + CDN |
| User data | Server-side, no cache (fresh on every request) |
| Public stats | ISR with 1-hour revalidation |
| Resume templates | ISR with 24-hour revalidation |
| AI responses | No cache (personalized) |

## Performance Monitoring

- Use Sentry (already integrated) for performance tracking
- Monitor Web Vitals in production
- Set performance budgets:
  - First Load JS: < 100kB per route
  - LCP: < 2.5s on 3G connection
  - Time to Interactive: < 3.5s
