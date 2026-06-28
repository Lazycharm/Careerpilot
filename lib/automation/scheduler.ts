/**
 * Lightweight scheduler for the automation cron.
 *
 * We deliberately avoid pulling in a full cron-expression parser. Automations
 * are scheduled by a small JSON config: cadence in minutes plus a working
 * window in the user's timezone (defaults to Asia/Dubai). This is exactly
 * what UAE-focused users need today; if we later need full crontab strings
 * we can swap in `croner` without touching callers.
 */

export interface ScheduleConfig {
  /** Minimum minutes between runs. Default 30. */
  cadenceMinutes?: number
  /** IANA tz string. Default 'Asia/Dubai'. */
  timezone?: string
  /** Working window start hour (24h). Default 9. */
  startHour?: number
  /** Working window end hour (24h, exclusive). Default 18. */
  endHour?: number
  /** Hard cap on applications per day. Default 10. */
  dailyCap?: number
}

const DEFAULTS: Required<ScheduleConfig> = {
  cadenceMinutes: 30,
  timezone: 'Asia/Dubai',
  startHour: 9,
  endHour: 18,
  dailyCap: 10,
}

export function withDefaults(cfg: ScheduleConfig | null | undefined): Required<ScheduleConfig> {
  return { ...DEFAULTS, ...(cfg ?? {}) }
}

/** Returns the next run timestamp ≥ `from`, respecting the working window. */
export function computeNextRunAt(
  from: Date,
  cfg: ScheduleConfig | null | undefined
): Date {
  const c = withDefaults(cfg)
  const candidate = new Date(from.getTime() + c.cadenceMinutes * 60_000)
  return moveIntoWorkingHours(candidate, c)
}

/** True iff `now` is inside the working window of the automation. */
export function isWithinWorkingHours(
  now: Date,
  cfg: ScheduleConfig | null | undefined
): boolean {
  const c = withDefaults(cfg)
  const hour = hourInTimezone(now, c.timezone)
  return hour >= c.startHour && hour < c.endHour
}

/**
 * If `at` falls inside the working window, return it untouched. Otherwise
 * roll forward to the next window opening.
 */
export function moveIntoWorkingHours(
  at: Date,
  cfg: Required<ScheduleConfig>
): Date {
  const hour = hourInTimezone(at, cfg.timezone)
  if (hour >= cfg.startHour && hour < cfg.endHour) return at

  // Next opening: today's startHour if we're before it, else tomorrow's.
  const dayStart = setHourInTimezone(at, cfg.startHour, cfg.timezone)
  if (at < dayStart) return dayStart
  return new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
}

/**
 * Hour-of-day in a target IANA timezone. Uses Intl.DateTimeFormat so we
 * don't need to ship a tz database.
 */
function hourInTimezone(d: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour12: false,
    hour: '2-digit',
  }).formatToParts(d)
  const h = parts.find((p) => p.type === 'hour')?.value ?? '0'
  return Number(h) % 24
}

/**
 * Return a Date whose tz-local clock reads `targetHour:00:00.000` on the
 * same y/m/d as `d`. Achieves this by computing the tz offset at `d` and
 * adjusting from UTC.
 */
function setHourInTimezone(d: Date, targetHour: number, timezone: string): Date {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const parts = Object.fromEntries(
    fmt.formatToParts(d).map((p) => [p.type, p.value] as const)
  )
  // Build the target local time string and parse as if it were UTC. Then
  // subtract the tz offset (UTC time minus that local interpretation).
  const targetLocal = `${parts.year}-${parts.month}-${parts.day}T${pad(targetHour)}:00:00`
  const utcLocal = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}Z`
  const tzOffsetMs = Date.parse(utcLocal) - d.getTime()
  return new Date(Date.parse(`${targetLocal}Z`) - tzOffsetMs)
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

/** Counts applications sent today by this automation, for daily-cap checks. */
export function startOfTodayUTC(now: Date): Date {
  const d = new Date(now)
  d.setUTCHours(0, 0, 0, 0)
  return d
}
