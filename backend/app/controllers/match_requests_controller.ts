import type { HttpContext } from '@adonisjs/core/http'
import MatchRequest from '#models/match_request'
import { notifyRequestAnswered } from '#services/notifications'
import { respondToRequest } from '#services/match_service'
import { matchChanged, requestChanged } from '#services/realtime'
import { requestActionValidator } from '#validators/match'

export default class MatchRequestsController {
  async index({ auth }: HttpContext) {
    const requests = await MatchRequest.query()
      .where('user_id', auth.getUserOrFail().id)
      .whereIn('status', ['pending'])
      .preload('match', (query) => query.preload('company'))
      .orderBy('created_at', 'desc')
    return requests.map((request) => ({
      id: request.id,
      kind: request.kind,
      status: request.status,
      match: {
        code: request.match.code,
        startsAt: request.match.startsAt.toISO(),
        courtNumber: request.match.courtNumber,
        companyName: request.match.company.name,
      },
    }))
  }

  async update({ bouncer, params, request }: HttpContext) {
    const { action } = await request.validateUsing(requestActionValidator)
    const existing = await MatchRequest.query()
      .where('id', params.id)
      .preload('match')
      .firstOrFail()
    await bouncer.authorize('respondToRequest', existing, action)

    const updated = await respondToRequest(existing.id, action)
    await notifyRequestAnswered(existing.match, existing, action)
    requestChanged(existing.userId)
    matchChanged(existing.match.code)
    return { id: updated.id, kind: updated.kind, status: updated.status }
  }
}
