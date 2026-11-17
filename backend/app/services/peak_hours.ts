import { DateTime } from 'luxon'
import { PANAMA_ZONE } from '#services/panama_time'

type Window = { from: number; to: number }

const WEEKDAY_PEAKS: Window[] = [
  { from: 11, to: 13 },
  { from: 16, to: 21 },
]
const WEEKEND_PEAKS: Window[] = [{ from: 7, to: 21 }]

export function isPeakHour(at: DateTime = DateTime.now()): boolean {
  const local = at.setZone(PANAMA_ZONE)
  const peaks = local.weekday >= 6 ? WEEKEND_PEAKS : WEEKDAY_PEAKS
  return peaks.some(({ from, to }) => local.hour >= from && local.hour < to)
}
