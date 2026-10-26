import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import BusinessRuleError from '#exceptions/business_rule_error'
import Availability from '#models/availability'
import { availabilityValidator } from '#validators/profile'
import { serializeAvailability } from '#serializers/availability_serializer'
import { PANAMA_ZONE, todayInPanama } from '#services/panama_time'
import { lobbyChanged } from '#services/realtime'

export default class AvailabilitiesController {
  async index({ auth }: HttpContext) {
    const slots = await Availability.query()
      .where('user_id', auth.getUserOrFail().id)
      .where('date', '>=', todayInPanama())
      .orderBy('date')
    return slots.map(serializeAvailability)
  }

  async upsert({ auth, params, request }: HttpContext) {
    const userId = auth.getUserOrFail().id
    const date = assertFutureDate(params.date)
    const data = await request.validateUsing(availabilityValidator)
    if (data.toTime <= data.fromTime)
      throw new BusinessRuleError('La hora de fin debe ser después de la de inicio')

    const existing = await Availability.query().where('user_id', userId).where('date', date).first()
    const slot = existing ?? new Availability()
    slot.merge({ userId, date: DateTime.fromISO(date, { zone: PANAMA_ZONE }), ...data })
    await slot.save()
    lobbyChanged()
    return serializeAvailability(slot)
  }

  async destroy({ auth, params, response }: HttpContext) {
    await Availability.query()
      .where('user_id', auth.getUserOrFail().id)
      .where('date', params.date)
      .delete()
    lobbyChanged()
    return response.noContent()
  }
}

function assertFutureDate(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < todayInPanama()) {
    throw new BusinessRuleError('La fecha debe ser hoy o una fecha futura')
  }
  return date
}
