import type { HttpContext } from '@adonisjs/core/http'
import { listFor, markRead } from '#services/notification_inbox'
import { serializeInbox } from '#serializers/notification_serializer'

export default class NotificationsController {
  async index({ auth }: HttpContext) {
    return serializeInbox(await listFor(auth.getUserOrFail()))
  }

  async markRead({ auth, response }: HttpContext) {
    await markRead(auth.getUserOrFail())
    return response.noContent()
  }
}
