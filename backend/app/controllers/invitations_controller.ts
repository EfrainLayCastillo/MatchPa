import type { HttpContext } from '@adonisjs/core/http'
import { notifyRequestCreated } from '#services/notifications'
import { findMatchByCode, inviteToMatch } from '#services/match_service'
import { pushInBackground } from '#services/push'
import { matchChanged, requestChanged } from '#services/realtime'
import { inviteValidator } from '#validators/match'

export default class InvitationsController {
  async store({ bouncer, params, request }: HttpContext) {
    const match = await findMatchByCode(params.code)
    await bouncer.authorize('manageMatch', match)

    const { userId } = await request.validateUsing(inviteValidator)
    const invitation = await inviteToMatch(params.code, userId)
    requestChanged(userId)
    matchChanged(params.code)
    pushInBackground(notifyRequestCreated(match, invitation))
    return { id: invitation.id, kind: invitation.kind, status: invitation.status }
  }
}
