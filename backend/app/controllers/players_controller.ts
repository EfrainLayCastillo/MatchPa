import type { HttpContext } from '@adonisjs/core/http'
import Availability from '#models/availability'
import Match from '#models/match'
import { serializePlayerAvailability } from '#serializers/availability_serializer'
import { playerFiltersValidator } from '#validators/match'
import { panamaDayBounds } from '#services/panama_time'

export default class PlayersController {
  async index({ auth, request }: HttpContext) {
    const me = auth.getUserOrFail()
    const { date, companyId } = await request.validateUsing(playerFiltersValidator)
    const busyIds = await busyPlayerIds(date)

    const slots = await Availability.query()
      .preload('user')
      .where('date', date)
      .whereNot('user_id', me.id)
      .if(busyIds.length > 0, (query) => query.whereNotIn('user_id', busyIds))
      .whereHas('user', (query) => {
        query.whereNotNull('category').whereNotNull('gender')
      })
      .if(companyId, (query) =>
        query.where((inner) => inner.whereNull('company_id').orWhere('company_id', companyId!))
      )
    return slots.map(serializePlayerAvailability)
  }
}

/** Players who already have a seat or organize a match that day are not free to be invited. */
async function busyPlayerIds(date: string): Promise<number[]> {
  const { start, end } = panamaDayBounds(date)
  const matches = await Match.query()
    .whereIn('status', ['open', 'full'])
    .where('starts_at', '>=', start.toSQL()!)
    .where('starts_at', '<', end.toSQL()!)
    .preload('requests')

  const ids = matches.flatMap((match) => [
    match.organizerId,
    ...match.requests
      .filter((request) => request.status === 'accepted')
      .map((request) => request.userId),
  ])
  return [...new Set(ids)]
}
