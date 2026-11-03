import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import logger from '@adonisjs/core/services/logger'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Match from '#models/match'
import MatchRequest from '#models/match_request'
import User from '#models/user'
import { bumpSessionVersion } from '#services/session'
import { notifyOrganizerDeleted, notifyPlayerDeleted } from '#services/notifications'
import { matchChanged, requestChanged } from '#services/realtime'
import { effectiveStatus } from '#services/match_rules'
import { closeLocked, lockMatchById, releaseSeat } from '#services/match_service'

export interface ClosedMatch {
  match: Match
  playerIds: number[]
  requesterIds: number[]
}

export interface AccountDeletionResult {
  closed: ClosedMatch[]
  freed: Match[]
  cancelledMatchCodes: string[]
}

export async function deleteAccount(user: User): Promise<AccountDeletionResult> {
  return db.transaction(async (trx) => {
    await lockPlayerRows(user.id, trx)
    const result = await leaveMatches(user, trx)
    await db.from('availabilities').useTransaction(trx).where('user_id', user.id).delete()
    await db.from('push_subscriptions').useTransaction(trx).where('user_id', user.id).delete()
    await db.from('email_verifications').useTransaction(trx).where('user_id', user.id).delete()
    await anonymize(user, trx)
    return result
  })
}

/**
 * User first (requestToJoin and accept lock it too), then their requests before any match,
 * matching respondToRequest's request → match order to avoid deadlocks.
 */
async function lockPlayerRows(userId: number, trx: TransactionClientContract) {
  await User.query({ client: trx }).where('id', userId).forUpdate().firstOrFail()
  await MatchRequest.query({ client: trx })
    .where('user_id', userId)
    .whereIn('status', ['pending', 'accepted'])
    .orderBy('id')
    .forUpdate()
}

async function leaveMatches(
  user: User,
  trx: TransactionClientContract
): Promise<AccountDeletionResult> {
  const result: AccountDeletionResult = { closed: [], freed: [], cancelledMatchCodes: [] }
  const now = DateTime.now().toSQL()!

  const organized = await Match.query({ client: trx })
    .where('organizer_id', user.id)
    .whereIn('status', ['open', 'full'])
    .where('starts_at', '>', now)
    .select('id')
  const seated = await MatchRequest.query({ client: trx })
    .where('user_id', user.id)
    .where('status', 'accepted')
    .whereHas('match', (query) => {
      query
        .whereNot('organizer_id', user.id)
        .whereIn('status', ['open', 'full'])
        .where('starts_at', '>', now)
    })
    .select('match_id')

  const organizedIds = new Set(organized.map((match) => match.id))
  const ids = [...new Set([...organizedIds, ...seated.map((request) => request.matchId)])].sort(
    (a, b) => a - b
  )

  for (const id of ids) {
    const match = await lockMatchById(id, trx)
    const status = effectiveStatus(match)
    if (status !== 'open' && status !== 'full') continue

    if (organizedIds.has(id)) {
      result.closed.push(closedMatchAudience(match))
      await closeLocked(match, trx)
    } else {
      const request = match.requests.find(
        (item) => item.userId === user.id && item.status === 'accepted'
      )
      if (!request) continue
      await releaseSeat(request, trx)
      result.freed.push(match)
    }
  }

  result.cancelledMatchCodes = await cancelFuturePending(user.id, now, trx)
  return result
}

function closedMatchAudience(match: Match): ClosedMatch {
  const idsWith = (status: string) =>
    match.requests.filter((request) => request.status === status).map((request) => request.userId)
  return { match, playerIds: idsWith('accepted'), requesterIds: idsWith('pending') }
}

async function cancelFuturePending(userId: number, now: string, trx: TransactionClientContract) {
  const pending = await MatchRequest.query({ client: trx })
    .where('user_id', userId)
    .where('status', 'pending')
    .whereHas('match', (query) => query.where('starts_at', '>', now))
    .preload('match')
  if (pending.length === 0) return []
  await MatchRequest.query({ client: trx })
    .whereIn(
      'id',
      pending.map((request) => request.id)
    )
    .update({ status: 'cancelled' })
  return pending.map((request) => request.match.code)
}

async function anonymize(user: User, trx: TransactionClientContract): Promise<void> {
  user.useTransaction(trx)
  user.merge({
    fullName: 'Jugador eliminado',
    email: `deleted-${user.id}@matchpa.invalid`,
    password: null,
    googleId: null,
    avatarUrl: null,
    whatsapp: null,
    category: null,
    gender: null,
    emailVerifiedAt: null,
    deletedAt: DateTime.now(),
  })
  bumpSessionVersion(user)
  await user.save()
}

/** Realtime first and push in the background: the account is already gone, so a push failure must not fail the request. */
export function announceAccountDeletion({
  closed,
  freed,
  cancelledMatchCodes,
}: AccountDeletionResult) {
  const codes = [
    ...closed.map(({ match }) => match.code),
    ...freed.map((m) => m.code),
    ...cancelledMatchCodes,
  ]
  new Set(codes).forEach((code) => matchChanged(code))
  new Set(closed.flatMap(({ playerIds, requesterIds }) => [...playerIds, ...requesterIds])).forEach(
    (userId) => requestChanged(userId)
  )

  Promise.all([
    ...closed.map(({ match, playerIds }) => notifyOrganizerDeleted(match, playerIds)),
    ...freed.map((match) => notifyPlayerDeleted(match)),
  ]).catch((error) => logger.error({ err: error }, 'account deletion push failed'))
}
