# Prisma migration policy

## Policy

This project uses **versioned migrations** via `prisma migrate`.

`prisma db push` is **forbidden** outside of throwaway local sandboxes.
`db push` skips migration history, which makes production-safe deploys and
rollbacks impossible. Every schema change must produce a migration file
checked into `prisma/migrations/`.

## Workflows

### Local schema change

```bash
# 1. Edit prisma/schema.prisma
# 2. Create a migration locally
npx prisma migrate dev --name <short_descriptive_name>
# 3. Commit the new migration folder
```

### Apply in production / staging

CI/CD runs the deploy step automatically:

```bash
npx prisma migrate deploy
```

This applies pending migrations only — never auto-resets.

### Adopting the proposed schema (one-time)

`prisma/schema.proposed.prisma` is the design target. We do NOT swap it in
all at once. Phase 1 will:

1. Diff the current schema against the proposal.
2. Generate a baseline migration capturing the live database as-is.
3. Apply the proposal incrementally in named migrations (one logical change
   per migration, e.g. `add_pricing_table`, `split_payment_from_subscription`).
4. Each migration must be reversible — write the down SQL in the file header
   as a comment.

## Conventions

- Migration names: `snake_case`, imperative (`add_*`, `drop_*`, `alter_*`).
- One responsibility per migration.
- Data backfills go in a separate migration after the schema change, never in
  the same file.
- Never rename a column without first adding the new column, dual-writing,
  backfilling, and only then dropping the old column.
- Never apply destructive migrations (DROP TABLE, DROP COLUMN) without:
  - a verified Supabase snapshot taken within the last hour
  - sign-off recorded in the PR description.

## Disaster recovery

- Supabase PITR is enabled (target retention: 7 days, increase before launch).
- Monthly restore drill: pick a random snapshot, restore to a scratch
  database, run smoke queries. Document outcome in `docs/runbooks/restore-drill.md`.
