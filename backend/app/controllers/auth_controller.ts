import type { HttpContext } from '@adonisjs/core/http'
import BusinessRuleError from '#exceptions/business_rule_error'
import env from '#start/env'
import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/auth'
import { serializeUser } from '#serializers/match_serializer'
import { safeNextPath } from '#services/next_path'

export default class AuthController {
  async register({ request, auth }: HttpContext) {
    const data = await request.validateUsing(registerValidator)
    const user = await User.create({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    })
    await auth.use('web').login(user)
    return serializeUser(user)
  }

  async login({ request, auth }: HttpContext) {
    const data = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(data.email, data.password).catch(() => {
      throw new BusinessRuleError('Correo o contraseña incorrectos')
    })
    await auth.use('web').login(user)
    return serializeUser(user)
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.noContent()
  }

  async googleRedirect({ request, session, ally }: HttpContext) {
    session.put('login_next', safeNextPath(request.input('next')))
    return ally.use('google').redirect()
  }

  async googleCallback({ session, auth, response, ally }: HttpContext) {
    const next = session.pull('login_next', '/lobby')
    const google = ally.use('google')
    if (google.accessDenied() || google.stateMisMatch() || google.hasError()) {
      return response.redirect(`${env.get('FRONTEND_URL')}/login`)
    }

    const profile = await google.user()
    const user = await findOrCreateGoogleUser(profile)
    if (!user) return response.redirect(`${env.get('FRONTEND_URL')}/login?error=email_registrado`)

    await auth.use('web').login(user)
    return response.redirect(`${env.get('FRONTEND_URL')}${next}`)
  }
}

/**
 * Only an existing Google link is reused. A password account with the same email is never
 * linked automatically: emails are not verified at sign-up, so linking would let a squatter
 * inherit the owner's access. Returns null in that case.
 */
async function findOrCreateGoogleUser(profile: {
  id: string
  email: string | null
  name: string
  avatarUrl: string | null
}) {
  const byGoogle = await User.findBy('googleId', profile.id)
  if (byGoogle) return byGoogle

  if (profile.email && (await User.findBy('email', profile.email))) return null

  return User.create({
    fullName: profile.name,
    email: profile.email ?? `${profile.id}@google.matchpa`,
    googleId: profile.id,
    avatarUrl: profile.avatarUrl,
  })
}
