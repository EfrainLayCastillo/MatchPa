import db from '@adonisjs/lucid/services/db'
import { Exception } from '@adonisjs/core/exceptions'
import BusinessRuleError from '#exceptions/business_rule_error'
import { isUniqueViolation } from '#exceptions/unique_violation'
import type Match from '#models/match'
import MatchSignal, { type SignalKind } from '#models/match_signal'
import type User from '#models/user'
import { signalDenial, type SignalRole } from '#services/match_rules'
import { lockMatchByCode } from '#services/match_service'

export interface SentSignal {
  match: Match
  role: SignalRole
  signal: MatchSignal
}

function roleIn(match: Match, user: User): SignalRole | null {
  if (match.organizerId === user.id) return 'organizer'
  const accepted = match.requests.some(
    (request) => request.userId === user.id && request.status === 'accepted'
  )
  return accepted ? 'player' : null
}

/** A player's signal goes to the organizer; the organizer's, to the accepted players. */
export function signalRecipients(match: Match, role: SignalRole): number[] {
  if (role === 'player') return [match.organizerId]
  return match.requests
    .filter((request) => request.status === 'accepted')
    .map((request) => request.userId)
}

/** Membership, status and window are checked under the match lock, so a concurrent close or remove cannot leave a stray signal. */
export async function sendSignal(code: string, user: User, kind: SignalKind): Promise<SentSignal> {
  try {
    return await db.transaction(async (trx) => {
      const match = await lockMatchByCode(code, trx)
      const role = roleIn(match, user)
      if (!role)
        throw new Exception('Solo el organizador y los jugadores aceptados', { status: 403 })
      const denial = signalDenial(match, role, kind)
      if (denial) throw new BusinessRuleError(denial)

      const signal = await MatchSignal.create(
        { matchId: match.id, userId: user.id, kind },
        { client: trx }
      )
      return { match, role, signal }
    })
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new BusinessRuleError('Ya mandaste este aviso', { status: 409 })
    }
    throw error
  }
}
