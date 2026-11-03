import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const mailConfig = defineConfig({
  default: env.get('MAIL_MAILER'),
  from: env.get('MAIL_FROM'),
  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST'),
      port: env.get('SMTP_PORT'),
    }),
    resend: transports.resend({
      key: env.get('RESEND_API_KEY')?.release() ?? '',
      baseUrl: 'https://api.resend.com',
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
