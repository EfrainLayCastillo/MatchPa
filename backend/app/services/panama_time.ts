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

/** Earliest half-hour "HH:MM" a slot starting today can use, or null when today has none left. */
export function earliestSlotToday(): string | null {
  const now = DateTime.now().setZone(PANAMA_ZONE)
  const minutes = Math.ceil((now.hour * 60 + now.minute) / 30) * 30
  if (minutes >= 24 * 60) return null
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}
