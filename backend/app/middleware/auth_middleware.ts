import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { errors } from '@adonisjs/auth'
import type { Authenticators } from '@adonisjs/auth/types'
import { isSessionStale } from '#services/session'

/**
 * Auth middleware is used authenticate HTTP requests and deny
 * access to unauthenticated users.
 */
export default class AuthMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    const user = await ctx.auth.authenticateUsing(options.guards)
    if (isSessionStale(ctx, user)) {
      await ctx.auth.use('web').logout()
      throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', { guardDriverName: 'session' })
    }
    return next()
  }
}
