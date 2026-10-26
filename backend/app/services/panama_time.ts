import { DateTime } from 'luxon'

export const PANAMA_ZONE = 'America/Panama'

export function todayInPanama(): string {
  return DateTime.now().setZone(PANAMA_ZONE).toISODate()!
}

/** UTC bounds of one calendar day in Panama, for filtering `starts_at`. */
export function panamaDayBounds(dateKey: string) {
  const start = DateTime.fromISO(dateKey, { zone: PANAMA_ZONE }).startOf('day')
  return { start: start.toUTC(), end: start.plus({ days: 1 }).toUTC() }
}
