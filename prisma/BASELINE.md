# Prisma Baseline / Init Migration

The Supabase database is **empty** (the previous DB was dropped and a fresh
one was created). That means we skip the historical "baseline an existing
schema" dance — Prisma can simply create and apply an init migration in one
step.

## One-time setup

### 1. Fill `.env.local`

You need at least:

- `DATABASE_URL` — Supabase pooled URL (port 6543, `?pgbouncer=true&connection_limit=1`)
- `DIRECT_URL` — Supabase direct URL (port 5432)
- `NEXTAUTH_SECRET` — `openssl rand -base64 32`
- `NEXTAUTH_URL` — `http://localhost:3000`
- `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000`

Both Supabase URLs come from Supabase dashboard → Settings → Database →
Connection string. Toggle "Connection pooling" on for `DATABASE_URL`, off for
`DIRECT_URL`.

### 2. Create the init migration

```bash
npx prisma migrate dev --name init
```

This single command:
1. Generates `prisma/migrations/<timestamp>_init/migration.sql` from the
   current `schema.prisma`.
2. Applies it to the empty Supabase database via `DIRECT_URL`.
3. Records it in the `_prisma_migrations` tracking table.

### 3. Verify

```bash
npx prisma migrate status
# Expected: "Database schema is up to date!"
```

### 4. Commit

```bash
git add prisma/migrations/
git commit -m "chore(db): init migration"
```

## After init

Subsequent schema changes use the standard flow from `prisma/MIGRATIONS.md`:

```bash
# Edit prisma/schema.prisma
npx prisma migrate dev --name <descriptive_name>
```

In production / Vercel deploys, the build step runs:

```bash
npx prisma migrate deploy
```

which applies pending migrations only.

## Roadmap of additive migrations

`prisma/schema.proposed.prisma` is the design target. Each Phase ships one
named, additive migration so the running app never breaks mid-rollout:

1. `add_pdfexport_atsreport_tables` (end of Phase 1)
2. `add_aisetting_table` (Phase 2)
3. `split_payment_from_subscription` + `add_pricing_whatsapptemplate_tables` (Phase 3)
4. `add_folder_document_tables` + `add_company_companycontact_tables` (Phase 4)
5. `add_emailcampaign_notification_auditlog_activitylog_tables` (Phase 5)
6. `add_automation_emailaccount_tables` (Phase 6)
7. `add_blogpost_industrypage_citypage_tables` (Phase 7)

Each lands in its own PR with rollback SQL in the migration's header comment.

## Production note

Until you have a live production Supabase, you can skip the production-side
steps. When you're ready:

1. Add a separate production Supabase project.
2. Add `DATABASE_URL`, `DIRECT_URL`, and a different `NEXTAUTH_SECRET` to
   Vercel → Environment Variables → Production.
3. Vercel runs `npx prisma migrate deploy` automatically on each deploy.
