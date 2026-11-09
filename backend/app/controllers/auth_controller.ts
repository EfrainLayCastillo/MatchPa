import type { HttpContext } from '@adonisjs/core/http'
import BusinessRuleError from '#exceptions/business_rule_error'
import env from '#start/env'
import User from '#models/user'
import {
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
  verifyEmailValidator,
} from '#validators/auth'
import { serializeUser } from '#serializers/match_serializer'
import { safeNextPath } from '#services/next_path'
import { issueCode, verifyCode } from '#services/email_verification'
import { requestReset, resetPassword } from '#services/password_reset'
import { startSession } from '#services/session'
import { emailCandidates } from '#services/account_lookup'
import { findOrLinkGoogleUser } from '#services/google_account'

export default class AuthController {
  async register(ctx: HttpContext) {
    const { request } = ctx
    const data = await request.validateUsing(registerValidator)
    const user = await User.create({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    })
    await issueCode(user)
    await startSession(ctx, user)
    return serializeUser(user)
  }

  async verifyEmail({ request, auth }: HttpContext) {
    const { code } = await request.validateUsing(verifyEmailValidator)
    const user = auth.getUserOrFail()
    await verifyCode(user, code)
    return serializeUser(user)
  }

  async resendEmailCode({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!user.emailVerifiedAt) await issueCode(user)
    return response.noContent()
  }

  async login(ctx: HttpContext) {
    const { request } = ctx
    const data = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(data.email, data.password).catch(() => {
      throw new BusinessRuleError('Correo o contraseña incorrectos')
    })
    await startSession(ctx, user)
    return serializeUser(user)
  }

  async forgotPassword({ request, response }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator)
    await requestReset(emailCandidates(email, request.input('email')))
    return response.noContent()
  }

  async resetPassword(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(resetPasswordValidator)
    const emails = emailCandidates(data.email, ctx.request.input('email'))
    const user = await resetPassword(emails, data.code, data.password)
    await startSession(ctx, user)
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

  async googleCallback(ctx: HttpContext) {
    const { session, response, ally } = ctx
    const next = session.pull('login_next', '/lobby')
    const google = ally.use('google')
    if (google.accessDenied() || google.stateMisMatch() || google.hasError()) {
      return response.redirect(`${env.get('FRONTEND_URL')}/login`)
    }

    const profile = await google.user()
    if (!profile.email) return response.redirect(`${env.get('FRONTEND_URL')}/login`)

    const user = await findOrLinkGoogleUser({ ...profile, email: profile.email })
    if (!user) return response.redirect(`${env.get('FRONTEND_URL')}/login?error=email_registrado`)

    await startSession(ctx, user)
    return response.redirect(`${env.get('FRONTEND_URL')}${next}`)
  }
}
