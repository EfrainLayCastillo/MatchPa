import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class EmailNotVerifiedError extends Exception {
  static status = 403
  static code = 'EMAIL_NOT_VERIFIED'

  constructor() {
    super('Verifica tu correo para continuar')
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.response
      .status(error.status)
      .send({ code: error.code, errors: [{ message: error.message }] })
  }
}
