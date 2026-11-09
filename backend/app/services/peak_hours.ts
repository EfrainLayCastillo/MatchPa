import { DateTime } from 'luxon'
import { PANAMA_ZONE } from '#services/panama_time'

const WEEKDAY_PEAK = { from: 17, to: 23 }
const WEEKEND_PEAK = { from: 7, to: 23 }

/** Keep in sync with the cron in .github/workflows/keep-awake.yml. */
export function isPeakHour(at: DateTime = DateTime.now()): boolean {
  const local = at.setZone(PANAMA_ZONE)
  const { from, to } = local.weekday >= 6 ? WEEKEND_PEAK : WEEKDAY_PEAK
  return local.hour >= from && local.hour < to
}
