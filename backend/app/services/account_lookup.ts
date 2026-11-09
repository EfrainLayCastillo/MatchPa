import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import User from '#models/user'

/** Password sign-ups store the normalized email; Google accounts store it as Google sends it. */
export function emailCandidates(normalized: string, raw: unknown) {
  return [
    ...new Set([
      normalized,
      String(raw ?? '')
        .trim()
        .toLowerCase(),
    ]),
  ]
}

export function findAccountByEmail(emails: string[], client?: TransactionClientContract) {
  return User.query({ client }).whereIn(db.raw('lower(email)'), emails).orderBy('id').first()
}
