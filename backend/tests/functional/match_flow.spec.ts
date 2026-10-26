import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import BusinessRuleError from '#exceptions/business_rule_error'
import Company from '#models/company'
import MatchRequest from '#models/match_request'
import User from '#models/user'
import {
  MAX_MATCHES_PER_DAY,
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
    return { match, players, organizer, company }
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
  test('un jugador aceptado en un partido no puede entrar a otro que se solapa', async ({
    assert,
  }) => {
    const { match, players, company } = await fixtures(0)
    const otherOrganizer = await User.create({
      fullName: 'Otro Org',
      email: `otro-${Date.now()}@t.test`,
      password: 'secret123',
      category: 4,
      gender: 'male',
    })
    const overlapping = await publishMatch(otherOrganizer, {
      companyId: company.id,
      courtNumber: 5,
      startsAt: match.startsAt,
      durationMinutes: 90,
      category: 4,
      type: 'mixed',
      maxPlayers: 4,
      guests: [],
    })

    const first = await requestToJoin(players[0], match.code)
    const second = await requestToJoin(players[0], overlapping.code)
    await respondToRequest(first.id, 'accept')
    await assert.rejects(() => respondToRequest(second.id, 'accept'), BusinessRuleError)
  })
  test('un jugador no puede sumar un partido si ya tiene el máximo del día', async ({ assert }) => {
    const { match, players, company } = await fixtures(0)
    const day = match.startsAt.setZone('America/Panama').startOf('day')
    const matchStart = match.startsAt
    const matchEnd = matchStart.plus({ minutes: match.durationMinutes })
    const slots = Array.from({ length: 12 }, (_, i) => day.plus({ hours: i * 2 })).filter(
      (slot) => !(slot < matchEnd && slot.plus({ minutes: 90 }) > matchStart)
    )

    for (const startsAt of slots.slice(0, MAX_MATCHES_PER_DAY)) {
      await publishMatch(players[0], {
        companyId: company.id,
        courtNumber: 2,
        startsAt,
        durationMinutes: 90,
        category: 4,
        type: 'mixed',
        maxPlayers: 4,
        guests: [],
      })
    }

    const error = await requestToJoin(players[0], match.code).catch((reason) => reason)
    assert.instanceOf(error, BusinessRuleError)
    assert.include(error.message, 'partidos ese día')
  })
  test('un organizador con partido abierto no puede unirse a otro que se solapa', async ({
    assert,
  }) => {
    const { match, players, company } = await fixtures(0)
    await publishMatch(players[0], {
      companyId: company.id,
      courtNumber: 6,
      startsAt: match.startsAt,
      durationMinutes: 90,
      category: 4,
      type: 'mixed',
      maxPlayers: 4,
      guests: [],
    })

    const error = await requestToJoin(players[0], match.code).catch((reason) => reason)
    assert.instanceOf(error, BusinessRuleError)
    assert.include(error.message, 'horario')
  })
})
