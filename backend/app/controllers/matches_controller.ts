import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import BusinessRuleError from '#exceptions/business_rule_error'
import Match from '#models/match'
import { serializeMatch } from '#serializers/match_serializer'
import { notifyBookingChanged, notifyMatchClosed, notifyMatchFilled } from '#services/notifications'
import { pushInBackground } from '#services/push'
import {
  matchQuery,
  findMatchByCode,
  closeMatch,
  confirmBooking,
  publishMatch,
  updateMatch,
} from '#services/match_service'
import { matchChanged } from '#services/realtime'
import { panamaDayBounds } from '#services/panama_time'
import { bookingValidator, matchFiltersValidator, matchValidator } from '#validators/match'

export default class MatchesController {
  async index({ auth, request }: HttpContext) {
    const viewer = auth.getUserOrFail()
    const { date, branchId, type } = await request.validateUsing(matchFiltersValidator)
    const matches = await matchQuery()
      .where('status', 'open')
      .where('starts_at', '>', DateTime.now().toUTC().toSQL()!)
      .if(date, (query) => {
        const { start, end } = panamaDayBounds(date!)
        query.where('starts_at', '>=', start.toSQL()!).where('starts_at', '<', end.toSQL()!)
      })
      .if(branchId, (query) => query.where('branch_id', branchId!))
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
      courtNumber: data.courtBooked ? (data.courtNumber ?? null) : null,
      startsAt,
      durationMinutes: data.durationMinutes as 60 | 90 | 120,
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
      courtNumber: data.courtBooked ? (data.courtNumber ?? null) : null,
      startsAt,
      durationMinutes: data.durationMinutes as 60 | 90 | 120,
      guests,
    })
    matchChanged(params.code)
    pushInBackground(
      notifyBookingChanged(updated.match, updated.bookingChange),
      updated.filled ? notifyMatchFilled(updated.match) : undefined
    )
    return serializeMatch(await findMatchByCode(params.code), auth.getUserOrFail())
  }

  async booking({ auth, bouncer, params, request }: HttpContext) {
    const match = await Match.query().where('code', params.code).firstOrFail()
    await bouncer.authorize('manageMatch', match)

    const { courtNumber } = await request.validateUsing(bookingValidator)
    const { match: booked, bookingChange } = await confirmBooking(params.code, courtNumber)
    matchChanged(params.code)
    pushInBackground(notifyBookingChanged(booked, bookingChange))
    return serializeMatch(await findMatchByCode(params.code), auth.getUserOrFail())
  }

  async close({ auth, bouncer, params }: HttpContext) {
    const match = await Match.query().where('code', params.code).firstOrFail()
    await bouncer.authorize('manageMatch', match)

    const closed = await closeMatch(params.code)
    const reloaded = await findMatchByCode(closed.code)
    const playerIds = reloaded.requests
      .filter((request) => request.status === 'accepted')
      .map((request) => request.userId)
    matchChanged(closed.code)
    pushInBackground(notifyMatchClosed(closed, playerIds))
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
