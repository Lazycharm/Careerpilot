-- CareerPilot pricing seed
-- Run this once in the Supabase SQL Editor (supabase.com → project → SQL Editor)
-- Safe to re-run: ON CONFLICT DO UPDATE overwrites without duplicating rows

INSERT INTO "Pricing" (id, code, name, description, "amountFils", currency, "durationDays", "isActive", features, "sortOrder", "createdAt", "updatedAt")
VALUES
  (
    gen_random_uuid(),
    'starter',
    'Starter Bundle',
    'Resume + Cover Letter + Interview Prep. Best value to get started.',
    1000,   -- 10.00 AED  (use coupon WELCOME50 for 5 AED)
    'AED',
    30,
    true,
    '{"downloads": 5, "coverLetters": 5, "interviews": 3, "automation": false, "tailored": false}',
    1,
    now(), now()
  ),
  (
    gen_random_uuid(),
    'pro',
    'Pro Bundle',
    'Unlimited resumes, cover letters, and interview prep for one month.',
    3900,   -- 39.00 AED/month
    'AED',
    30,
    true,
    '{"downloads": -1, "coverLetters": -1, "interviews": -1, "automation": false, "tailored": true}',
    2,
    now(), now()
  ),
  (
    gen_random_uuid(),
    'pro_annual',
    'Pro Annual',
    'Everything in Pro, billed once a year. Save 169 AED vs monthly.',
    29900,  -- 299.00 AED/year
    'AED',
    365,
    true,
    '{"downloads": -1, "coverLetters": -1, "interviews": -1, "automation": false, "tailored": true}',
    3,
    now(), now()
  ),
  (
    gen_random_uuid(),
    'automation',
    'Automation',
    'AI job application automation — apply to 100s of jobs on autopilot.',
    2900,   -- 29.00 AED/month
    'AED',
    30,
    true,
    '{"downloads": 0, "coverLetters": 0, "interviews": 0, "automation": true, "tailored": false}',
    4,
    now(), now()
  ),
  (
    gen_random_uuid(),
    'growth',
    'Growth Bundle',
    'Pro + Automation. Everything CareerPilot offers, one price.',
    5900,   -- 59.00 AED/month
    'AED',
    30,
    true,
    '{"downloads": -1, "coverLetters": -1, "interviews": -1, "automation": true, "tailored": true}',
    5,
    now(), now()
  )
ON CONFLICT (code) DO UPDATE SET
  name           = EXCLUDED.name,
  description    = EXCLUDED.description,
  "amountFils"   = EXCLUDED."amountFils",
  "durationDays" = EXCLUDED."durationDays",
  "isActive"     = EXCLUDED."isActive",
  features       = EXCLUDED.features,
  "sortOrder"    = EXCLUDED."sortOrder",
  "updatedAt"    = now();
