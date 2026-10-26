import type Company from '#models/company'
import type Match from '#models/match'
import type MatchRequest from '#models/match_request'
import type User from '#models/user'
import { effectiveStatus, spotsLeft } from '#services/match_rules'

export function serializeCompany(company: Company) {
  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    phone: company.phone,
    locationLabel: company.locationLabel,
    mapsUrl: company.mapsUrl,
    website: company.website,
  }
}

export function serializeUser(user: User) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    phone: user.whatsapp,
    category: user.category,
    gender: user.gender,
  }
}

function serializePlayer(user: Pick<User, 'id' | 'fullName' | 'category' | 'gender'>) {
  return { id: user.id, fullName: user.fullName, category: user.category, gender: user.gender }
}

function serializeRequest(request: MatchRequest) {
  return {
    id: request.id,
    kind: request.kind,
    status: request.status,
    user: serializePlayer(request.user),
  }
}

/** Expects `company`, `organizer`, `guests`, `requests` (with `user`) preloaded. */
export function serializeMatch(match: Match, viewer: User | null) {
  const isOrganizer = viewer?.id === match.organizerId
  // The organizer's WhatsApp is for the organizer and the players who joined, nobody else.
  const isLive = ['open', 'full'].includes(effectiveStatus(match))
  const canSeeWhatsapp =
    isLive &&
    viewer !== null &&
    (isOrganizer || match.requests.some((r) => r.userId === viewer.id && r.status === 'accepted'))
  const accepted = match.requests.filter((request) => request.status === 'accepted')
  const mine = viewer
    ? match.requests.find(
        (request) =>
          request.userId === viewer.id && ['pending', 'accepted'].includes(request.status)
      )
    : undefined

  return {
    id: match.id,
    code: match.code,
    organizer: {
      id: match.organizer.id,
      fullName: match.organizer.fullName,
      phone: canSeeWhatsapp ? match.organizer.whatsapp : null,
    },
    company: serializeCompany(match.company),
    courtNumber: match.courtNumber,
    startsAt: match.startsAt.toISO(),
    updatedAt: match.updatedAt?.toISO() ?? null,
    durationMinutes: match.durationMinutes,
    category: match.category,
    type: match.type,
    maxPlayers: match.maxPlayers,
    status: effectiveStatus(match),
    spotsLeft: Math.max(spotsLeft(match), 0),
    guests: match.guests.map((guest) => ({
      id: guest.id,
      name: guest.name,
      category: guest.category,
      gender: guest.gender,
    })),
    players: [match.organizer, ...accepted.map((request) => request.user)].map(serializePlayer),
    isOrganizer,
    myRequest: mine ? { id: mine.id, kind: mine.kind, status: mine.status } : null,
    requests: isOrganizer ? match.requests.map(serializeRequest) : undefined,
  }
}
