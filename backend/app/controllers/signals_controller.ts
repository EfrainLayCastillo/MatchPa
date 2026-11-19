import type { HttpContext } from '@adonisjs/core/http'
import { notifySignal } from '#services/notifications'
import { pushInBackground } from '#services/push'
import { matchSignal } from '#services/realtime'
import { sendSignal } from '#services/signal_service'
import { signalValidator } from '#validators/signal'

export default class SignalsController {
  async store({ auth, params, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { kind } = await request.validateUsing(signalValidator)
    const { match, role, signal } = await sendSignal(params.code, user, kind)

    matchSignal(match.code)
    if (role === 'player') pushInBackground(notifySignal(match, user, kind))
    return response.created({
      userId: user.id,
      fullName: user.fullName,
      kind: signal.kind,
      createdAt: signal.createdAt.toISO(),
    })
  }
}
