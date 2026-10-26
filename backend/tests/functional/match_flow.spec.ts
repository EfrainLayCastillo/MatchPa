import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import BusinessRuleError from '#exceptions/business_rule_error'
import Company from '#models/company'
import MatchRequest from '#models/match_request'
import User from '#models/user'
import {
  findMatchByCode,
  publishMatch,
  requestToJoin,
  respondToRequest,
} from '#services/match_service'

test.group('flujo de partidos', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function fixtures(guestCount: number) {
    const suffix = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`
    const company = await Company.create({
      name: 'WePadel',
      slug: `wepadel-${suffix}`,
      phone: '+507 200-0001',
      locationLabel: 'Centennial',
      mapsUrl: 'https://maps.google.com',
      website: 'https://wepadel.com',
    })
    const organizer = await User.create({
      fullName: 'Org Test',
      email: `org-${suffix}@t.test`,
      password: 'secret123',
      category: 4,
      gender: 'male',
    })
    const guests = Array.from({ length: guestCount }, (_, i) => ({
      name: `Invitado ${i + 1}`,
      category: 4,
      gender: 'male' as const,
    }))
    const match = await publishMatch(organizer, {
      companyId: company.id,
      courtNumber: 3,
      startsAt: DateTime.now().plus({ days: 1 }),
      durationMinutes: 90,
      category: 4,
      type: 'mixed',
      maxPlayers: 4,
      guests,
    })
    const players = await Promise.all(
      [1, 2].map((i) =>
        User.create({
          fullName: `Jugador ${i}`,
          email: `pl${i}-${suffix}@t.test`,
          password: 'secret123',
          category: 4,
          gender: 'male',
        })
      )
    )
    return { match, players }
  }

  async function statusOf(code: string) {
    const match = await findMatchByCode(code)
    return match.status
  }

  async function requestStatus(id: number) {
    const request = await MatchRequest.findOrFail(id)
    return request.status
  }

  test('al salir un jugador, el puesto vuelve a abrirse', async ({ assert }) => {
    const { match, players } = await fixtures(2)
    const request = await requestToJoin(players[0], match.code)
    await respondToRequest(request.id, 'accept')
    assert.equal(await statusOf(match.code), 'full')

    await respondToRequest(request.id, 'leave')
    assert.equal(await statusOf(match.code), 'open')
  })

  test('al completarse el partido se cancelan las solicitudes pendientes', async ({ assert }) => {
    const { match, players } = await fixtures(2)
    const accepted = await requestToJoin(players[0], match.code)
    const waiting = await requestToJoin(players[1], match.code)

    await respondToRequest(accepted.id, 'accept')

    assert.equal(await statusOf(match.code), 'full')
    assert.equal(await requestStatus(waiting.id), 'cancelled')
  })

  test('no se permite una segunda solicitud activa del mismo jugador', async ({ assert }) => {
    const { match, players } = await fixtures(0)
    await requestToJoin(players[0], match.code)

    await assert.rejects(() => requestToJoin(players[0], match.code), BusinessRuleError)
  })
})
