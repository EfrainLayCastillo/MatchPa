import type { HttpContext } from '@adonisjs/core/http'
import PushSubscription from '#models/push_subscription'
import { pushSubscriptionValidator } from '#validators/match'
import vine from '@vinejs/vine'

const removeValidator = vine.create({ endpoint: vine.string().url() })

export default class PushSubscriptionsController {
  async store({ auth, request, response }: HttpContext) {
    const data = await request.validateUsing(pushSubscriptionValidator)
    await PushSubscription.updateOrCreate(
      { endpoint: data.endpoint },
      { userId: auth.getUserOrFail().id, p256dh: data.keys.p256dh, auth: data.keys.auth }
    )
    return response.noContent()
  }

  async destroy({ auth, request, response }: HttpContext) {
    const { endpoint } = await request.validateUsing(removeValidator)
    await PushSubscription.query()
      .where('endpoint', endpoint)
      .where('user_id', auth.getUserOrFail().id)
      .delete()
    return response.noContent()
  }
}
