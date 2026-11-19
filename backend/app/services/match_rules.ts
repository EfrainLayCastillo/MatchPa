import { DateTime } from 'luxon'
import type Match from '#models/match'
import type { MatchStatus } from '#models/match'
import type { SignalKind } from '#models/match_signal'

export const MIN_PLAYERS = 4
export const MAX_PLAYERS_LIMIT = 6

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

export type SignalRole = 'organizer' | 'player'

const SIGNAL_WINDOW_BEFORE_MINUTES = 60
const SIGNAL_WINDOW_AFTER_MINUTES = 15

/** Returns why the signal cannot be sent, or null when it can. */
export function signalDenial(
  match: Match,
  role: SignalRole,
  kind: SignalKind,
  now: DateTime = DateTime.now()
): string | null {
  if (match.status === 'closed') return 'El partido está cerrado'
  if (role === 'organizer' && kind === 'on_the_way') {
    return 'Como organizador no puedes avisar que vas en camino'
  }
  const opensAt = match.startsAt.minus({ minutes: SIGNAL_WINDOW_BEFORE_MINUTES })
  const closesAt = match.startsAt.plus({ minutes: SIGNAL_WINDOW_AFTER_MINUTES })
  if (now < opensAt) return 'Todavía es temprano para avisar, falta más de una hora'
  if (now > closesAt) return 'Ya pasó el tiempo para mandar avisos de este partido'
  return null
}
