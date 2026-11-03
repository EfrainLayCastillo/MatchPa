import db from '@adonisjs/lucid/services/db'
import limiter from '@adonisjs/limiter/services/main'
import mail from '@adonisjs/mail/services/main'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import BusinessRuleError from '#exceptions/business_rule_error'
import EmailVerification from '#models/email_verification'
import User from '#models/user'
import CodeNotification from '#mails/code_notification'
import { CODE_TTL_MINUTES, consumeCode, createCode } from '#services/one_time_codes'

/** Same message for unknown email, wrong, expired or exhausted code: otherwise it reveals which emails exist. */
const INVALID_CODE = 'El código no es válido o venció. Pide uno nuevo'

/** Per account, not per typed email: Gmail dot and +tag variants reach the same user. */
const resetsPerAccount = limiter.use({ requests: 5, duration: '1 hour' })

function findAccount(emails: string[], client?: TransactionClientContract) {
  return User.query({ client }).whereIn(db.raw('lower(email)'), emails).first()
}

export async function requestReset(emails: string[]): Promise<void> {
  const user = await findAccount(emails)
  if (!user) return
  await resetsPerAccount.attempt(`password_reset_${user.id}`, async () => {
    const code = await createCode(user.id, 'reset_password')
    await mail.sendLater(new CodeNotification(user, code, CODE_TTL_MINUTES, 'reset_password'))
  })
}

async function consumeResetCode(user: User | null, code: string, trx: TransactionClientContract) {
  if (!user) return false
  try {
    return await consumeCode(user.id, 'reset_password', code, trx)
  } catch {
    return false
  }
}

async function applyNewPassword(user: User, password: string, trx: TransactionClientContract) {
  user.useTransaction(trx)
  user.password = password
  user.emailVerifiedAt ??= DateTime.now()
  user.sessionVersion += 1
  await user.save()
  await EmailVerification.query({ client: trx })
    .where('userId', user.id)
    .where('purpose', 'verify_email')
    .delete()
}

export async function resetPassword(emails: string[], code: string, password: string) {
  const user = await db.transaction(async (trx) => {
    const found = await findAccount(emails, trx)
    if (!found || !(await consumeResetCode(found, code, trx))) return null
    await applyNewPassword(found, password, trx)
    return found
  })
  if (!user) throw new BusinessRuleError(INVALID_CODE)
  return user
}
