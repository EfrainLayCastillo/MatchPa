import logger from '@adonisjs/core/services/logger'
import type Match from '#models/match'
import type MatchRequest from '#models/match_request'
import type { BookingChange, RequestAction } from '#services/match_service'
import Notification, { type NotificationType } from '#models/notification'
import { notifyUsers, type PushPayload } from '#services/push'
import { notificationCreated } from '#services/realtime'

const linkTo = (match: Match) => `/partidos/${match.code}`

/** Saves the inbox entry before pushing: the inbox must not depend on VAPID or on a device being subscribed. */
async function deliver(
  type: NotificationType,
  match: Match,
  userIds: number[],
  payload: PushPayload
): Promise<void> {
  if (userIds.length === 0) return
  await saveInboxEntries(type, match, userIds)
  await notifyUsers(userIds, payload)
}

async function saveInboxEntries(type: NotificationType, match: Match, userIds: number[]) {
  try {
    await Notification.createMany(userIds.map((userId) => ({ userId, matchId: match.id, type })))
    userIds.forEach(notificationCreated)
  } catch (error) {
    logger.error({ err: error, type, matchId: match.id }, 'inbox entries failed')
  }
}

export function notifyRequestCreated(match: Match, request: MatchRequest): Promise<void> {
  if (request.kind === 'join_request') {
    return deliver('join_requested', match, [match.organizerId], {
      title: 'Nueva solicitud',
      body: 'Alguien quiere unirse a tu partido',
      url: linkTo(match),
    })
  }
  return deliver('invited', match, [request.userId], {
    title: 'Ey Pa, ¿juegas?',
    body: 'Te invitaron a un partido',
    url: linkTo(match),
  })
}

type AnswerType = Extract<
  NotificationType,
  'request_accepted' | 'invitation_accepted' | 'request_rejected' | 'invitation_rejected'
>

const ANSWER_PAYLOADS: Record<AnswerType, (url: string) => PushPayload> = {
  request_accepted: (url) => ({ title: '¡Match!', body: 'Ya estás en el partido', url }),
  invitation_accepted: (url) => ({ title: '¡Match!', body: 'Aceptaron tu invitación', url }),
  request_rejected: (url) => ({
    title: 'Solicitud rechazada',
    body: 'Esta vez no hubo lugar',
    url,
  }),
  invitation_rejected: (url) => ({
    title: 'Invitación rechazada',
    body: 'No pudo esta vez',
    url,
  }),
}

function answerType(isJoin: boolean, accepted: boolean): AnswerType {
  if (accepted) return isJoin ? 'request_accepted' : 'invitation_accepted'
  return isJoin ? 'request_rejected' : 'invitation_rejected'
}

export function notifyRequestAnswered(
  match: Match,
  request: MatchRequest,
  action: RequestAction
): Promise<void> {
  const url = linkTo(match)
  if (action === 'leave') {
    return deliver('player_left', match, [match.organizerId], {
      title: 'Se salió un jugador',
      body: 'Hay un puesto libre',
      url,
    })
  }
  if (action === 'remove') {
    return deliver('player_removed', match, [request.userId], {
      title: 'Te sacaron del partido',
      body: 'El organizador te quitó del partido',
      url,
    })
  }
  const accepted = action === 'accept'
  const isJoin = request.kind === 'join_request'
  const recipient = isJoin ? request.userId : match.organizerId
  const type = answerType(isJoin, accepted)
  return deliver(type, match, [recipient], ANSWER_PAYLOADS[type](url))
}

export function notifyMatchClosed(match: Match, playerIds: number[]): Promise<void> {
  return deliver('match_closed', match, playerIds, {
    title: 'Partido cerrado',
    body: 'El organizador cerró la búsqueda',
    url: linkTo(match),
  })
}

export function notifyOrganizerDeleted(match: Match, playerIds: number[]): Promise<void> {
  return deliver('match_cancelled', match, playerIds, {
    title: 'Partido cancelado',
    body: 'El organizador eliminó su cuenta',
    url: linkTo(match),
  })
}

export function notifyPlayerDeleted(match: Match): Promise<void> {
  return deliver('player_deleted', match, [match.organizerId], {
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
    deliver('match_filled', match, [match.organizerId], {
      title: '¡Match!',
      body: organizerBody,
      url,
    }),
    deliver('match_filled', match, playerIds, { title: '¡Match!', body, url }),
  ]).then(() => undefined)
}

export function notifyBookingChanged(match: Match, change: BookingChange): Promise<void> {
  if (change === null) return Promise.resolve()
  const court = `${match.branch.name}, cancha ${match.courtNumber}`
  const bodies = {
    booked: { type: 'court_booked', title: 'Cancha confirmada', body: court },
    court_changed: { type: 'court_changed', title: 'Cambio de cancha', body: court },
    unbooked: {
      type: 'court_unbooked',
      title: 'Cancha por reservar',
      body: 'La cancha volvió a quedar por reservar',
    },
  } as const
  const playerIds = match.requests
    .filter((request) => request.status === 'accepted')
    .map((request) => request.userId)
  const { type, title, body } = bodies[change]
  return deliver(type, match, playerIds, { title, body, url: linkTo(match) })
}
