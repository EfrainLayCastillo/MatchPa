import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'
import BusinessRuleError from '#exceptions/business_rule_error'
import EmailNotVerifiedError from '#exceptions/email_not_verified_error'
import type User from '#models/user'
import CodeNotification from '#mails/code_notification'
import { CODE_TTL_MINUTES, MAX_ATTEMPTS, consumeCode, createCode } from '#services/one_time_codes'

export { CODE_TTL_MINUTES, MAX_ATTEMPTS }

export function assertEmailVerified(user: User): void {
  if (!user.emailVerifiedAt) throw new EmailNotVerifiedError()
}

async function isVerified(userId: number, trx: TransactionClientContract) {
  const row = await trx.from('users').where('id', userId).whereNotNull('email_verified_at').first()
  return Boolean(row)
}

export async function issueCode(user: User): Promise<void> {
  const code = await createCode(user.id, 'verify_email')
  await mail.sendLater(new CodeNotification(user, code, CODE_TTL_MINUTES, 'verify_email'))
}

async function consumeOrAlreadyVerified(user: User, code: string, trx: TransactionClientContract) {
  try {
    return await consumeCode(user.id, 'verify_email', code, trx)
  } catch (error) {
    if (await isVerified(user.id, trx)) return null
    throw error
  }
}

export async function verifyCode(user: User, code: string): Promise<void> {
  if (user.emailVerifiedAt) return

  const accepted = await db.transaction(async (trx) => {
    const result = await consumeOrAlreadyVerified(user, code, trx)
    if (result) {
      user.useTransaction(trx)
      user.emailVerifiedAt = DateTime.now()
      await user.save()
    }
    return result
  })
  if (accepted === false) throw new BusinessRuleError('Código incorrecto')
}
