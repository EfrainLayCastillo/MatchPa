import { BaseMail } from '@adonisjs/mail'
import type User from '#models/user'

export default class VerifyEmailNotification extends BaseMail {
  constructor(
    private user: Pick<User, 'fullName' | 'email'>,
    private code: string,
    private ttlMinutes: number
  ) {
    super()
  }

  prepare() {
    this.message
      .to(this.user.email)
      .subject(`Tu código de MatchPa: ${this.code}`)
      .replyTo('hola@matchpa.app')
      .text(
        `Hola ${this.user.fullName}, tu código de verificación es ${this.code}. Vence en ${this.ttlMinutes} minutos.`
      )
      .html(
        `<p>Hola ${escapeHtml(this.user.fullName)},</p>` +
          `<p>Tu código de verificación es:</p>` +
          `<p style="font-size:28px;font-weight:bold;letter-spacing:6px">${this.code}</p>` +
          `<p>Vence en ${this.ttlMinutes} minutos.</p>`
      )
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}
