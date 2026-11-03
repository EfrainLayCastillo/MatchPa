import { BaseMail } from '@adonisjs/mail'
import type User from '#models/user'
import type { CodePurpose } from '#services/one_time_codes'
import { codeEmailHtml, codeEmailText, type CodeEmail } from '#mails/templates/code_email'

const COPY: Record<CodePurpose, { subject: (code: string) => string; intro: string }> = {
  verify_email: {
    subject: (code) => `Tu código de MatchPa: ${code}`,
    intro: 'Usa este código para verificar tu correo en MatchPa.',
  },
  reset_password: {
    subject: (code) => `Tu código para cambiar la contraseña: ${code}`,
    intro:
      'Usa este código para crear una contraseña nueva. Si no lo pediste, tu cuenta sigue segura.',
  },
}

export default class CodeNotification extends BaseMail {
  constructor(
    private user: Pick<User, 'fullName' | 'email'>,
    private code: string,
    private ttlMinutes: number,
    private purpose: CodePurpose
  ) {
    super()
  }

  prepare() {
    const copy = COPY[this.purpose]
    const content: CodeEmail = {
      name: this.user.fullName,
      intro: copy.intro,
      code: this.code,
      ttlMinutes: this.ttlMinutes,
    }
    this.message
      .to(this.user.email)
      .subject(copy.subject(this.code))
      .replyTo('hola@matchpa.app')
      .text(codeEmailText(content))
      .html(codeEmailHtml(content))
  }
}
