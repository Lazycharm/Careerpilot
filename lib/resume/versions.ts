/**
 * Resume version snapshot helpers.
 *
 * Auto-pinning policy: pin a snapshot every Nth update (default N=25).
 * The editor's PATCH /api/resumes/[id] route should call
 * `maybeRecordAutoVersion(resumeId, prevDataJson)` BEFORE persisting the
 * new payload — that way the snapshot captures the pre-edit state, which
 * is what a "revert" would restore.
 *
 * Pure functions where possible so the auto-pin decision is unit-testable.
 */

import { prisma } from '@/lib/prisma'

const AUTO_PIN_EVERY = 25

/** True when the `nthSave`-th edit since creation should pin a snapshot. */
export function shouldAutoPin(nthSave: number, every: number = AUTO_PIN_EVERY): boolean {
  if (!Number.isFinite(nthSave) || nthSave <= 0) return false
  return nthSave % every === 0
}

/**
 * Conditionally write a snapshot. Counts the number of existing versions for
 * the resume; when (count + 1) is a multiple of `AUTO_PIN_EVERY`, pins.
 *
 * Pass the resume's CURRENT `data` Json (before applying the incoming PATCH).
 */
export async function maybeRecordAutoVersion(
  resumeId: string,
  currentData: unknown
): Promise<{ pinned: boolean }> {
  const count = await prisma.resumeVersion.count({ where: { resumeId } })
  if (!shouldAutoPin(count + 1)) return { pinned: false }
  await prisma.resumeVersion.create({
    data: {
      resumeId,
      label: null, // null marks auto-pinned
      data: currentData as any,
    },
  })
  return { pinned: true }
}
