import type { HttpContext } from '@adonisjs/core/http'
import { updateProfileValidator } from '#validators/profile'
import { serializeUser } from '#serializers/match_serializer'

export default class MeController {
  async show({ auth }: HttpContext) {
    return serializeUser(auth.getUserOrFail())
  }

  async update({ auth, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(updateProfileValidator)
    user.merge(data)
    await user.save()
    return serializeUser(user)
  }
}
