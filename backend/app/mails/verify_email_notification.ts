import { BaseMail } from '@adonisjs/mail'
import type User from '#models/user'
import { codeEmailHtml, codeEmailText, type CodeEmail } from '#mails/templates/code_email'

export default class VerifyEmailNotification extends BaseMail {
  constructor(
    private user: Pick<User, 'fullName' | 'email'>,
    private code: string,
    private ttlMinutes: number
  ) {
    super()
  }

  prepare() {
    const content: CodeEmail = {
      name: this.user.fullName,
      intro: 'Usa este código para verificar tu correo en MatchPa.',
      code: this.code,
      ttlMinutes: this.ttlMinutes,
    }
    this.message
      .to(this.user.email)
      .subject(`Tu código de MatchPa: ${this.code}`)
      .replyTo('hola@matchpa.app')
      .text(codeEmailText(content))
      .html(codeEmailHtml(content))
  }
}
