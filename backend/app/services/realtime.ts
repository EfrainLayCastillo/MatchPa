import transmit from '@adonisjs/transmit/services/main'

/** Lobby lists and the match page refetch on these events; the payload stays minimal. */
export function matchChanged(code: string): void {
  transmit.broadcast('lobby', { type: 'match.updated' })
  transmit.broadcast(`matches/${code}`, { type: 'match.updated' })
}

export function lobbyChanged(): void {
  transmit.broadcast('lobby', { type: 'availability.changed' })
}

export function requestChanged(userId: number): void {
  transmit.broadcast(`users/${userId}`, { type: 'request.updated' })
}
