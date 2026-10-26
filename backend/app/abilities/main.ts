import { Bouncer } from '@adonisjs/bouncer'
import type Match from '#models/match'
import type MatchRequest from '#models/match_request'
import type User from '#models/user'
import type { RequestAction } from '#services/match_service'

export const manageMatch = Bouncer.ability(
  (user: User, match: Match) => match.organizerId === user.id
)

export const respondToRequest = Bouncer.ability(
  (user: User, request: MatchRequest, action: RequestAction) => {
    const isOrganizer = request.match.organizerId === user.id
    const isRequester = request.userId === user.id

    const allowed: Record<RequestAction, boolean> = {
      accept: request.kind === 'join_request' ? isOrganizer : isRequester,
      reject: request.kind === 'join_request' ? isOrganizer : isRequester,
      leave: isRequester,
      remove: isOrganizer,
    }
    return allowed[action]
  }
)
