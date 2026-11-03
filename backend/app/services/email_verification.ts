import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import BusinessRuleError from '#exceptions/business_rule_error'
import EmailVerification from '#models/email_verification'
import type User from '#models/user'
import VerifyEmailNotification from '#mails/verify_email_notification'

export const CODE_TTL_MINUTES = 15
export const MAX_ATTEMPTS = 5

function hashCode(code: string) {
  return createHmac('sha256', env.get('APP_KEY').release()).update(code).digest('hex')
}

function matches(code: string, codeHash: string) {
  const expected = Buffer.from(codeHash, 'hex')
  const actual = Buffer.from(hashCode(code), 'hex')
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

async function isVerified(userId: number, trx: TransactionClientContract) {
  const row = await trx.from('users').where('id', userId).whereNotNull('email_verified_at').first()
  return Boolean(row)
}

export async function issueCode(user: User): Promise<void> {
  const code = randomInt(0, 1_000_000).toString().padStart(6, '0')
  await EmailVerification.updateOrCreate(
    { userId: user.id },
    {
      codeHash: hashCode(code),
      expiresAt: DateTime.now().plus({ minutes: CODE_TTL_MINUTES }),
      attempts: 0,
    }
  )
  await mail.sendLater(new VerifyEmailNotification(user, code, CODE_TTL_MINUTES))
}

export async function verifyCode(user: User, code: string): Promise<void> {
  if (user.emailVerifiedAt) return

  const expired = new BusinessRuleError(
    'El código venció o se agotaron los intentos. Pide uno nuevo'
  )
  const wrong = await db.transaction(async (trx) => {
    const row = await EmailVerification.query({ client: trx })
      .where('userId', user.id)
      .forUpdate()
      .first()
    if (!row && (await isVerified(user.id, trx))) return false
    if (!row || row.expiresAt <= DateTime.now() || row.attempts >= MAX_ATTEMPTS) throw expired

    if (!matches(code, row.codeHash)) {
      row.useTransaction(trx)
      row.attempts += 1
      await row.save()
      return true
    }

    user.useTransaction(trx)
    user.emailVerifiedAt = DateTime.now()
    await user.save()
    await row.delete()
    return false
  })
  if (wrong) throw new BusinessRuleError('Código incorrecto')
}
