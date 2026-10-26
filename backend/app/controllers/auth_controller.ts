import type { HttpContext } from '@adonisjs/core/http'
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
    const user = await User.verifyCredentials(data.email, data.password)
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
    const user = await findOrLinkGoogleUser(profile)
    await auth.use('web').login(user)
    return response.redirect(`${env.get('FRONTEND_URL')}${next}`)
  }
}

async function findOrLinkGoogleUser(profile: {
  id: string
  email: string | null
  name: string
  avatarUrl: string | null
}) {
  const byGoogle = await User.findBy('googleId', profile.id)
  if (byGoogle) return byGoogle

  const byEmail = profile.email ? await User.findBy('email', profile.email) : null
  if (byEmail) {
    byEmail.googleId = profile.id
    await byEmail.save()
    return byEmail
  }

  return User.create({
    fullName: profile.name,
    email: profile.email ?? `${profile.id}@google.matchpa`,
    googleId: profile.id,
    avatarUrl: profile.avatarUrl,
  })
}
