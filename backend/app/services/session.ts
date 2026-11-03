import type { HttpContext } from '@adonisjs/core/http'
import type User from '#models/user'

export async function startSession({ auth, session }: HttpContext, user: User) {
  await auth.use('web').login(user)
  session.put('session_version', user.sessionVersion ?? 0)
}

/** A password reset bumps `sessionVersion`; cookie sessions can't be revoked server-side otherwise. */
export function isSessionStale({ session }: HttpContext, user: User) {
  return session.get('session_version', 0) !== user.sessionVersion
}

/** Every other device's session goes stale on its next request. */
export function bumpSessionVersion(user: User) {
  user.sessionVersion = (user.sessionVersion ?? 0) + 1
}
