import type Match from '#models/match'
import type MatchRequest from '#models/match_request'
import type { RequestAction } from '#services/match_service'
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
