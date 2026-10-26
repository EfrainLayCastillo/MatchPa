import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import type Match from '#models/match'
import { effectiveStatus, spotsLeft } from '#services/match_rules'

function matchWith(overrides: Partial<Match>): Match {
  return {
    status: 'open',
    maxPlayers: 4,
    startsAt: DateTime.now().plus({ days: 1 }),
    guests: [],
    requests: [],
    ...overrides,
  } as unknown as Match
}

test.group('match rules', () => {
  test('el organizador ocupa un puesto y los invitados y aceptados restan', ({ assert }) => {
    const match = matchWith({
      guests: [{}, {}] as Match['guests'],
      requests: [{ status: 'accepted' }, { status: 'pending' }] as Match['requests'],
    })
    assert.equal(spotsLeft(match), 0)
  })

  test('un partido cuya hora ya pasó expira aunque siga abierto', ({ assert }) => {
    const match = matchWith({ startsAt: DateTime.now().minus({ minutes: 1 }) })
    assert.equal(effectiveStatus(match), 'expired')
  })

  test('un partido cerrado se mantiene cerrado aunque su hora haya pasado', ({ assert }) => {
    const match = matchWith({ status: 'closed', startsAt: DateTime.now().minus({ minutes: 1 }) })
    assert.equal(effectiveStatus(match), 'closed')
  })
})
