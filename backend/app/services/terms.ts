import { DateTime } from 'luxon'
import type User from '#models/user'

export const TERMS_VERSION = '2026-11-16'

export function acceptTerms(user: User) {
  user.merge({ termsAcceptedAt: DateTime.utc(), termsVersion: TERMS_VERSION })
}

export function hasAcceptedCurrentTerms(user: User) {
  return user.termsVersion === TERMS_VERSION
}
