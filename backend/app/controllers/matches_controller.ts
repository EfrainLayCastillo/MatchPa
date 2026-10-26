import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import BusinessRuleError from '#exceptions/business_rule_error'
import Match from '#models/match'
import { serializeMatch } from '#serializers/match_serializer'
import { notifyMatchClosed } from '#services/notifications'
import {
  matchQuery,
  findMatchByCode,
  closeMatch,
  publishMatch,
  updateMatch,
} from '#services/match_service'
import { matchChanged } from '#services/realtime'
import { panamaDayBounds } from '#services/panama_time'
import { matchFiltersValidator, matchValidator } from '#validators/match'

export default class MatchesController {
  async index({ auth, request }: HttpContext) {
    const viewer = auth.getUserOrFail()
    const { date, companyId, type } = await request.validateUsing(matchFiltersValidator)
    const { start, end } = panamaDayBounds(date)

    const matches = await matchQuery()
      .where('status', 'open')
      .where('starts_at', '>', DateTime.now().toSQL()!)
      .where('starts_at', '>=', start.toSQL()!)
      .where('starts_at', '<', end.toSQL()!)
      .if(companyId, (query) => query.where('company_id', companyId!))
      .if(type, (query) => query.where('type', type!))
      .orderBy('starts_at')
    return matches.map((match) => serializeMatch(match, viewer))
  }

  async store({ auth, request }: HttpContext) {
    const organizer = auth.getUserOrFail()
    const data = await request.validateUsing(matchValidator)
    const guests = data.guests ?? []
    const startsAt = parseFutureStart(data.startsAt)
    assertRoomFor(guests.length, data.maxPlayers)

    const match = await publishMatch(organizer, {
      ...data,
      startsAt,
      durationMinutes: data.durationMinutes as 90 | 120,
      guests,
    })
    matchChanged(match.code)
    return serializeMatch(await findMatchByCode(match.code), organizer)
  }

  async show({ auth, params }: HttpContext) {
    const match = await findMatchByCode(params.code)
    return serializeMatch(match, auth.user ?? null)
  }

  async update({ auth, bouncer, params, request }: HttpContext) {
    const match = await Match.query().where('code', params.code).firstOrFail()
    await bouncer.authorize('manageMatch', match)

    const data = await request.validateUsing(matchValidator)
    const guests = data.guests ?? []
    const startsAt = parseFutureStart(data.startsAt)
    assertRoomFor(guests.length, data.maxPlayers)

    const updated = await updateMatch(params.code, {
      ...data,
      startsAt,
      durationMinutes: data.durationMinutes as 90 | 120,
      guests,
    })
    matchChanged(updated.code)
    return serializeMatch(await findMatchByCode(updated.code), auth.getUserOrFail())
  }

  async close({ auth, bouncer, params }: HttpContext) {
    const match = await Match.query().where('code', params.code).firstOrFail()
    await bouncer.authorize('manageMatch', match)

    const closed = await closeMatch(params.code)
    const reloaded = await findMatchByCode(closed.code)
    const playerIds = reloaded.requests
      .filter((request) => request.status === 'accepted')
      .map((request) => request.userId)
    await notifyMatchClosed(closed, playerIds)
    matchChanged(closed.code)
    return serializeMatch(reloaded, auth.getUserOrFail())
  }
}

function parseFutureStart(value: string): DateTime {
  const startsAt = DateTime.fromISO(value)
  if (!startsAt.isValid) throw new BusinessRuleError('La fecha del partido no es válida')
  if (startsAt <= DateTime.now()) throw new BusinessRuleError('El partido debe ser en el futuro')
  return startsAt
}

function assertRoomFor(guestCount: number, maxPlayers: number): void {
  if (guestCount > maxPlayers - 1)
    throw new BusinessRuleError('Hay más jugadores que puestos en el partido')
}
