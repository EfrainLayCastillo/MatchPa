import type { HttpContext } from '@adonisjs/core/http'
import { updateProfileValidator } from '#validators/profile'
import BusinessRuleError from '#exceptions/business_rule_error'
import { serializeUser } from '#serializers/match_serializer'
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
}
