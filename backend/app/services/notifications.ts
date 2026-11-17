import type Match from '#models/match'
import type MatchRequest from '#models/match_request'
import type { BookingChange, RequestAction } from '#services/match_service'
import { notifyUsers } from '#services/push'

const linkTo = (match: Match) => `/partidos/${match.code}`

export function notifyRequestCreated(match: Match, request: MatchRequest): Promise<void> {
  if (request.kind === 'join_request') {
    return notifyUsers([match.organizerId], {
      title: 'Nueva solicitud',
      body: 'Alguien quiere unirse a tu partido',
      url: linkTo(match),
    })
  }
  return notifyUsers([request.userId], {
    title: 'Ey Pa, ¿juegas?',
    body: 'Te invitaron a un partido',
    url: linkTo(match),
  })
}

export function notifyRequestAnswered(
  match: Match,
  request: MatchRequest,
  action: RequestAction
): Promise<void> {
  const url = linkTo(match)
  if (action === 'leave') {
    return notifyUsers([match.organizerId], {
      title: 'Se salió un jugador',
      body: 'Hay un puesto libre',
      url,
    })
  }
  if (action === 'remove') {
    return notifyUsers([request.userId], {
      title: 'Te sacaron del partido',
      body: 'El organizador te quitó del partido',
      url,
    })
  }
  const accepted = action === 'accept'
  const recipient = request.kind === 'join_request' ? request.userId : match.organizerId
  return notifyUsers([recipient], {
    title: accepted ? '¡Match!' : 'Solicitud rechazada',
    body: accepted ? 'Ya estás en el partido' : 'Esta vez no hubo lugar',
    url,
  })
}

export function notifyMatchClosed(match: Match, playerIds: number[]): Promise<void> {
  return notifyUsers(playerIds, {
    title: 'Partido cerrado',
    body: 'El organizador cerró la búsqueda',
    url: linkTo(match),
  })
}

export function notifyOrganizerDeleted(match: Match, playerIds: number[]): Promise<void> {
  return notifyUsers(playerIds, {
    title: 'Partido cancelado',
    body: 'El organizador eliminó su cuenta',
    url: linkTo(match),
  })
}

export function notifyPlayerDeleted(match: Match): Promise<void> {
  return notifyUsers([match.organizerId], {
    title: 'Se liberó un puesto',
    body: 'Un jugador eliminó su cuenta',
    url: linkTo(match),
  })
}

/** Tells the organizer and the accepted players the match is complete; `skipUserIds` already got a push for this action. */
export function notifyMatchFilled(match: Match, skipUserIds: number[] = []): Promise<void> {
  const url = linkTo(match)
  const body = `Ya están los ${match.maxPlayers}`
  const organizerBody =
    match.courtBookedAt === null ? `Reserva la cancha en ${match.branch.name}` : body
  const playerIds = match.requests
    .filter((request) => request.status === 'accepted' && !skipUserIds.includes(request.userId))
    .map((request) => request.userId)
  return Promise.all([
    notifyUsers([match.organizerId], { title: '¡Match!', body: organizerBody, url }),
    notifyUsers(playerIds, { title: '¡Match!', body, url }),
  ]).then(() => undefined)
}

export function notifyBookingChanged(match: Match, change: BookingChange): Promise<void> {
  if (change === null) return Promise.resolve()
  const court = `${match.branch.name}, cancha ${match.courtNumber}`
  const bodies = {
    booked: { title: 'Cancha confirmada', body: court },
    court_changed: { title: 'Cambio de cancha', body: court },
    unbooked: { title: 'Cancha por reservar', body: 'La cancha quedó por reservar' },
  }
  const playerIds = match.requests
    .filter((request) => request.status === 'accepted')
    .map((request) => request.userId)
  return notifyUsers(playerIds, { ...bodies[change], url: linkTo(match) })
}
