import type { HttpContext } from '@adonisjs/core/http'
import { deleteAccountValidator } from '#validators/account'
import { updateProfileValidator } from '#validators/profile'
import { serializeUser } from '#serializers/match_serializer'
import { announceAccountDeletion, deleteAccount } from '#services/account_deletion'
import { acceptTerms } from '#services/terms'

export default class MeController {
  async show({ auth, session }: HttpContext) {
    const authEvent = session.pull('auth_event') as 'google_signup' | 'google_login' | undefined
    return { ...serializeUser(auth.getUserOrFail()), ...(authEvent && { authEvent }) }
  }

  async update({ auth, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(updateProfileValidator)
    user.merge(data)
    await user.save()
    return serializeUser(user)
  }

  async acceptTerms({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    acceptTerms(user)
    await user.save()
    return serializeUser(user)
  }

  async destroy({ auth, request, response }: HttpContext) {
    await request.validateUsing(deleteAccountValidator)
    const result = await deleteAccount(auth.getUserOrFail())
    await auth.use('web').logout()
    announceAccountDeletion(result)
    return response.noContent()
  }
}
