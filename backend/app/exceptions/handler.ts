import app from '@adonisjs/core/services/app'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { isUniqueViolation } from '#exceptions/unique_violation'

const GENERIC_MESSAGE = 'Algo salió mal. Intenta de nuevo.'

function isUnexpected(error: unknown): boolean {
  const status = (error as { status?: unknown } | null)?.status
  return typeof status !== 'number' || status >= 500
}

function wantsJson(error: unknown, ctx: HttpContext): boolean {
  const hasOwnHandler = typeof (error as { handle?: unknown } | null)?.handle === 'function'
  return !hasOwnHandler && ctx.request.accepts(['json', 'html']) === 'json'
}

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    if (isUniqueViolation(error)) {
      return ctx.response
        .status(422)
        .send({ errors: [{ field: 'email', message: 'Ya existe una cuenta con este correo' }] })
    }
    if (app.inProduction && isUnexpected(error) && wantsJson(error, ctx)) {
      return ctx.response.status(500).send({ message: GENERIC_MESSAGE })
    }
    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
