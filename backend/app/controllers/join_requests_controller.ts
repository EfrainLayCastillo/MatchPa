import type { HttpContext } from '@adonisjs/core/http'
import { notifyRequestCreated } from '#services/notifications'
import { findMatchByCode, requestToJoin } from '#services/match_service'
import { matchChanged } from '#services/realtime'

export default class JoinRequestsController {
  async store({ auth, params }: HttpContext) {
    const request = await requestToJoin(auth.getUserOrFail(), params.code)
    await notifyRequestCreated(await findMatchByCode(params.code), request)
    matchChanged(params.code)
    return { id: request.id, kind: request.kind, status: request.status }
  }
}
