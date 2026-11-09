import { DateTime } from 'luxon'
import User from '#models/user'
import { forgotPasswordValidator } from '#validators/auth'
import { emailCandidates, findAccountByEmail } from '#services/account_lookup'

export type GoogleProfile = {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  emailVerificationState: string
  original?: { hd?: string }
}

const GOOGLE_MAIL_DOMAINS = new Set(['gmail.com', 'googlemail.com'])

async function findByEmail(email: string) {
  const { email: normalized } = await forgotPasswordValidator.validate({ email })
  return findAccountByEmail(emailCandidates(normalized, email))
}

function createGoogleUser(profile: GoogleProfile) {
  return User.create({
    fullName: profile.name,
    email: profile.email,
    googleId: profile.id,
    avatarUrl: profile.avatarUrl,
    emailVerifiedAt: profile.emailVerificationState === 'verified' ? DateTime.now() : null,
  })
}

/**
 * Google only keeps owning the mailbox for Gmail and for Workspace domains (`hd`); for any other
 * address `email_verified` just means it was verified once, possibly by a former owner.
 */
function googleOwnsMailbox(profile: GoogleProfile) {
  const domain = profile.email.split('@').pop()?.toLowerCase()
  const ownsDomain = GOOGLE_MAIL_DOMAINS.has(domain ?? '') || profile.original?.hd === domain
  return ownsDomain && profile.emailVerificationState === 'verified'
}

/** An unverified account may belong to a squatter who registered the owner's email. */
function canLink(user: User, profile: GoogleProfile) {
  return !!user.emailVerifiedAt && !user.googleId && googleOwnsMailbox(profile)
}

export async function findOrLinkGoogleUser(profile: GoogleProfile) {
  const byGoogle = await User.findBy('googleId', profile.id)
  if (byGoogle) return byGoogle

  const byEmail = await findByEmail(profile.email)
  if (!byEmail) return createGoogleUser(profile)
  if (!canLink(byEmail, profile)) return null

  byEmail.googleId = profile.id
  await byEmail.save()
  return byEmail
}
