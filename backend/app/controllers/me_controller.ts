import type { HttpContext } from '@adonisjs/core/http'
import { deleteAccountValidator } from '#validators/account'
import { updateProfileValidator } from '#validators/profile'
import BusinessRuleError from '#exceptions/business_rule_error'
import { serializeUser } from '#serializers/match_serializer'
import { type AccountDeletionResult, deleteAccount } from '#services/account_deletion'
import { notifyOrganizerDeleted, notifyPlayerDeleted } from '#services/notifications'
import { matchChanged, requestChanged } from '#services/realtime'
import { normalizeWhatsapp } from '#services/whatsapp'

export default class MeController {
  async show({ auth }: HttpContext) {
    return serializeUser(auth.getUserOrFail())
  }

  async update({ auth, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const { phone, ...data } = await request.validateUsing(updateProfileValidator)
    if (phone !== undefined) {
      const whatsapp = normalizeWhatsapp(phone)
      if (!whatsapp) throw new BusinessRuleError('El número de WhatsApp no es válido')
      user.whatsapp = whatsapp
    }
    user.merge(data)
    await user.save()
    return serializeUser(user)
  }

  async destroy({ auth, request, response }: HttpContext) {
    await request.validateUsing(deleteAccountValidator)
    const result = await deleteAccount(auth.getUserOrFail())
    await auth.use('web').logout()
    await announceDeletion(result)
    return response.noContent()
  }
}

async function announceDeletion({ closed, freed, cancelledMatchCodes }: AccountDeletionResult) {
  await Promise.all([
    ...closed.map(({ match, playerIds }) => notifyOrganizerDeleted(match, playerIds)),
    ...freed.map((match) => notifyPlayerDeleted(match)),
  ])
  const codes = [
    ...closed.map(({ match }) => match.code),
    ...freed.map((m) => m.code),
    ...cancelledMatchCodes,
  ]
  new Set(codes).forEach((code) => matchChanged(code))
  new Set(closed.flatMap(({ playerIds, requesterIds }) => [...playerIds, ...requesterIds])).forEach(
    (userId) => requestChanged(userId)
  )
}
