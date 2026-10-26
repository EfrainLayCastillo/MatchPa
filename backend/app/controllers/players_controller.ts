import type { HttpContext } from '@adonisjs/core/http'
import Availability from '#models/availability'
import { playerFiltersValidator } from '#validators/match'
import { serializePlayerAvailability } from '#serializers/availability_serializer'

export default class PlayersController {
  async index({ auth, request }: HttpContext) {
    const me = auth.getUserOrFail()
    const { date, companyId } = await request.validateUsing(playerFiltersValidator)

    const slots = await Availability.query()
      .preload('user')
      .where('date', date)
      .whereHas('user', (query) => {
        query.whereNot('id', me.id).whereNotNull('category').whereNotNull('gender')
      })
      .if(companyId, (query) =>
        query.where((inner) => inner.whereNull('company_id').orWhere('company_id', companyId!))
      )
    return slots.map(serializePlayerAvailability)
  }
}
