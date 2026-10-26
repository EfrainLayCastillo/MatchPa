import { randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import BusinessRuleError from '#exceptions/business_rule_error'
import Match, { type MatchStatus, type MatchType } from '#models/match'
import MatchGuest from '#models/match_guest'
import MatchRequest, { type RequestStatus } from '#models/match_request'
import type User from '#models/user'
import { effectiveStatus, spotsLeft } from '#services/match_rules'

export type RequestAction = 'accept' | 'reject' | 'leave' | 'remove'

export interface GuestInput {
  name: string
  category: number
  gender: 'male' | 'female'
}

export interface MatchInput {
  companyId: number
  courtNumber: number
  startsAt: DateTime
  durationMinutes: 90 | 120
  category: number
  type: MatchType
  maxPlayers: number
  guests: GuestInput[]
}

const ACTIVE: RequestStatus[] = ['pending', 'accepted']

const TRANSITIONS: Record<RequestAction, { from: RequestStatus; to: RequestStatus }> = {
  accept: { from: 'pending', to: 'accepted' },
  reject: { from: 'pending', to: 'rejected' },
  leave: { from: 'accepted', to: 'left' },
  remove: { from: 'accepted', to: 'removed' },
}

export async function publishMatch(organizer: User, input: MatchInput): Promise<Match> {
  return db.transaction(async (trx) => {
    const match = await Match.create(
      { ...matchFields(input), code: generateCode(), organizerId: organizer.id, status: 'open' },
      { client: trx }
    )
    await MatchGuest.createMany(
      input.guests.map((guest) => ({ ...guest, matchId: match.id })),
      { client: trx }
    )
    await syncStatus(match.id, trx)
    return loadMatch(match.id, trx)
  })
}

export async function updateMatch(code: string, input: MatchInput): Promise<Match> {
  return db.transaction(async (trx) => {
    const locked = await lockMatchByCode(code, trx)
    assertOpen(locked)

    locked.merge(matchFields(input)).useTransaction(trx)
    await locked.save()
    await MatchGuest.query({ client: trx }).where('match_id', locked.id).delete()
    await MatchGuest.createMany(
      input.guests.map((guest) => ({ ...guest, matchId: locked.id })),
      { client: trx }
    )

    const fresh = await loadMatch(locked.id, trx)
    if (spotsLeft(fresh) < 0) throw new BusinessRuleError('No hay puestos para tantos jugadores')
    await syncStatus(locked.id, trx)
    return loadMatch(locked.id, trx)
  })
}

export async function closeMatch(code: string): Promise<Match> {
  return db.transaction(async (trx) => {
    const match = await lockMatchByCode(code, trx)
    const status = effectiveStatus(match)
    if (status !== 'open' && status !== 'full')
      throw new BusinessRuleError('Este partido ya no está disponible')

    match.status = 'closed'
    match.closedAt = DateTime.now()
    await match.useTransaction(trx).save()
    await cancelPending(match.id, trx)
    return loadMatch(match.id, trx)
  })
}

export async function requestToJoin(user: User, code: string): Promise<MatchRequest> {
  return db.transaction(async (trx) => {
    const match = await lockMatchByCode(code, trx)
    if (match.organizerId === user.id)
      throw new BusinessRuleError('No puedes unirte a tu propio partido')
    assertOpen(match)
    await assertNoActiveRequest(match.id, user.id, trx)
    return MatchRequest.create(
      { matchId: match.id, userId: user.id, kind: 'join_request', status: 'pending' },
      { client: trx }
    )
  })
}

export async function inviteToMatch(code: string, userId: number): Promise<MatchRequest> {
  return db.transaction(async (trx) => {
    const match = await lockMatchByCode(code, trx)
    assertOpen(match)
    await assertNoActiveRequest(match.id, userId, trx)
    return MatchRequest.create(
      { matchId: match.id, userId, kind: 'invitation', status: 'pending' },
      { client: trx }
    )
  })
}

export async function respondToRequest(
  requestId: number,
  action: RequestAction
): Promise<MatchRequest> {
  return db.transaction(async (trx) => {
    const request = await MatchRequest.query({ client: trx })
      .where('id', requestId)
      .forUpdate()
      .firstOrFail()
    const match = await lockMatchById(request.matchId, trx)
    const transition = TRANSITIONS[action]
    if (request.status !== transition.from)
      throw new BusinessRuleError('Esta solicitud ya no se puede cambiar')

    if (action === 'accept') {
      if (effectiveStatus(match) !== 'open')
        throw new BusinessRuleError('Este partido ya no está abierto')
      if (spotsLeft(match) <= 0) throw new BusinessRuleError('No quedan puestos disponibles')
    }

    request.status = transition.to
    await request.useTransaction(trx).save()
    await syncStatus(match.id, trx)
    return request
  })
}

export function generateCode(): string {
  return randomBytes(6).toString('base64url')
}

export function loadMatch(id: number, trx: TransactionClientContract): Promise<Match> {
  return Match.query({ client: trx })
    .where('id', id)
    .preload('guests')
    .preload('requests', (query) => query.preload('user'))
    .preload('company')
    .preload('organizer')
    .firstOrFail()
}

function matchFields(input: MatchInput) {
  return {
    companyId: input.companyId,
    courtNumber: input.courtNumber,
    startsAt: input.startsAt,
    durationMinutes: input.durationMinutes,
    category: input.category,
    type: input.type,
    maxPlayers: input.maxPlayers,
  }
}

function assertOpen(match: Match): void {
  if (effectiveStatus(match) !== 'open')
    throw new BusinessRuleError('Este partido ya no está abierto')
}

async function assertNoActiveRequest(
  matchId: number,
  userId: number,
  trx: TransactionClientContract
): Promise<void> {
  const active = await MatchRequest.query({ client: trx })
    .where('match_id', matchId)
    .where('user_id', userId)
    .whereIn('status', ACTIVE)
    .first()
  if (active) throw new BusinessRuleError('Ya tienes una solicitud activa en este partido')
}

/** Keeps `open`/`full` in step with the seats. A full match cancels whatever is still pending. */
async function syncStatus(matchId: number, trx: TransactionClientContract): Promise<void> {
  const match = await loadMatch(matchId, trx)
  if (match.status === 'closed') return

  const next: MatchStatus = spotsLeft(match) > 0 ? 'open' : 'full'
  if (next === 'full') await cancelPending(matchId, trx)
  if (match.status !== next) {
    match.status = next
    await match.useTransaction(trx).save()
  }
}

async function cancelPending(matchId: number, trx: TransactionClientContract): Promise<void> {
  await MatchRequest.query({ client: trx })
    .where('match_id', matchId)
    .where('status', 'pending')
    .update({ status: 'cancelled' })
}

function lockMatchByCode(code: string, trx: TransactionClientContract): Promise<Match> {
  return Match.query({ client: trx })
    .where('code', code)
    .forUpdate()
    .firstOrFail()
    .then((match) => loadMatch(match.id, trx))
}

function lockMatchById(id: number, trx: TransactionClientContract): Promise<Match> {
  return Match.query({ client: trx })
    .where('id', id)
    .forUpdate()
    .firstOrFail()
    .then((match) => loadMatch(match.id, trx))
}

/** Read query with every relation the serializer needs. */
export function matchQuery() {
  return Match.query()
    .preload('company')
    .preload('organizer')
    .preload('guests')
    .preload('requests', (query) => query.preload('user'))
}

export function findMatchByCode(code: string): Promise<Match> {
  return matchQuery().where('code', code).firstOrFail()
}
