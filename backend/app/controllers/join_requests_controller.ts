import type { HttpContext } from '@adonisjs/core/http'
import { notifyRequestCreated } from '#services/notifications'
import { findMatchByCode, requestToJoin } from '#services/match_service'
import { pushInBackground } from '#services/push'
import { matchChanged } from '#services/realtime'

export default class JoinRequestsController {
  async store({ auth, params }: HttpContext) {
    const request = await requestToJoin(auth.getUserOrFail(), params.code)
    const match = await findMatchByCode(params.code)
    matchChanged(params.code)
    pushInBackground(notifyRequestCreated(match, request))
    return { id: request.id, kind: request.kind, status: request.status }
  }
}
