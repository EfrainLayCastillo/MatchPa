import { DateTime } from 'luxon'
import type Match from '#models/match'
import type { MatchStatus } from '#models/match'

export type EffectiveStatus = MatchStatus | 'expired'

/** Players still needed: the organizer is one seat, guests and accepted requests take the rest. */
export function spotsLeft(match: Match): number {
  const accepted = match.requests.filter((request) => request.status === 'accepted').length
  return match.maxPlayers - 1 - match.guests.length - accepted
}

export function effectiveStatus(match: Match, now: DateTime = DateTime.now()): EffectiveStatus {
  if (match.status === 'closed') return 'closed'
  if (match.startsAt <= now) return 'expired'
  return match.status
}
