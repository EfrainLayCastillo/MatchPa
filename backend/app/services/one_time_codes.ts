import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'
import { DateTime } from 'luxon'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import limiter from '@adonisjs/limiter/services/main'
import env from '#start/env'
import BusinessRuleError from '#exceptions/business_rule_error'
import EmailVerification from '#models/email_verification'

export type CodePurpose = 'verify_email' | 'reset_password'

export const CODE_TTL_MINUTES = 15
export const MAX_ATTEMPTS = 5
export const MAX_DAILY_FAILURES = 10

const EXHAUSTED = 'El código venció o se agotaron los intentos. Pide uno nuevo'

/** Survives reissuing: otherwise every new code grants MAX_ATTEMPTS fresh guesses. */
const dailyFailures = limiter.use({ requests: MAX_DAILY_FAILURES, duration: '24 hours' })

function hashCode(code: string) {
  return createHmac('sha256', env.get('APP_KEY').release()).update(code).digest('hex')
}

function matches(code: string, codeHash: string) {
  const expected = Buffer.from(codeHash, 'hex')
  const actual = Buffer.from(hashCode(code), 'hex')
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

export async function createCode(userId: number, purpose: CodePurpose): Promise<string> {
  const code = randomInt(0, 1_000_000).toString().padStart(6, '0')
  await EmailVerification.updateOrCreate(
    { userId, purpose },
    {
      codeHash: hashCode(code),
      expiresAt: DateTime.now().plus({ minutes: CODE_TTL_MINUTES }),
      attempts: 0,
    }
  )
  return code
}

/** Throws if missing/expired/exhausted; returns false on a wrong code (attempt already counted). */
export async function consumeCode(
  userId: number,
  purpose: CodePurpose,
  code: string,
  trx: TransactionClientContract
): Promise<boolean> {
  const row = await EmailVerification.query({ client: trx })
    .where('userId', userId)
    .where('purpose', purpose)
    .forUpdate()
    .first()
  const failuresKey = `code_failures_${purpose}_${userId}`
  const exhausted = (await dailyFailures.remaining(failuresKey)) <= 0
  if (!row || row.expiresAt <= DateTime.now() || row.attempts >= MAX_ATTEMPTS || exhausted) {
    throw new BusinessRuleError(EXHAUSTED)
  }

  if (!matches(code, row.codeHash)) {
    await dailyFailures.increment(failuresKey)
    row.useTransaction(trx)
    row.attempts += 1
    await row.save()
    return false
  }
  await row.useTransaction(trx).delete()
  return true
}
