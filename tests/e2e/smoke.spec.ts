/**
 * Smoke test — landing page → auth gate redirect.
 *
 * Validates the public homepage loads, sign-in CTAs are present, and that
 * a protected route bounces to /auth/login when accessed anonymously.
 * Deeper flows (CV builder, payment, admin queue) land in later phases
 * when those screens are rebuilt.
 */

import { expect, test } from '@playwright/test'

test.describe('public smoke', () => {
  test('landing page renders and exposes sign-in CTAs', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/UAE Resume Builder|Career Pilot/i)

    // The landing page renders two "Get Started" CTAs (nav + hero). Strict-mode
    // would fail on the broad role-based locator, so we take the first match.
    await expect(page.getByRole('link', { name: /login/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /get started/i }).first()).toBeVisible()
  })

  test('dashboard redirects to login when anonymous', async ({ page }) => {
    // We don't assert response.ok() — the redirect chain on mobile may yield
    // a non-2xx intermediate. The real intent is "did we end up on login?".
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})
