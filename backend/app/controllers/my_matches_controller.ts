import type { HttpContext } from '@adonisjs/core/http'
import { serializeMatch } from '#serializers/match_serializer'
import { matchQuery } from '#services/match_service'

export default class MyMatchesController {
  async index({ auth }: HttpContext) {
    const me = auth.getUserOrFail()
    const matches = await matchQuery()
      .where((query) => {
        query.where('organizer_id', me.id).orWhereHas('requests', (requests) => {
          requests.where('user_id', me.id).where('status', 'accepted')
        })
      })
      .orderBy('starts_at', 'desc')
    return matches.map((match) => serializeMatch(match, me))
  }
}
