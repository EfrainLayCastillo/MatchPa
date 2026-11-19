import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import BusinessRuleError from '#exceptions/business_rule_error'
import EmailNotVerifiedError from '#exceptions/email_not_verified_error'
import Branch from '#models/branch'
import Match from '#models/match'
import MatchRequest from '#models/match_request'
import User from '#models/user'
import {
  MAX_MATCHES_PER_DAY,
  closeMatch,
  findMatchByCode,
  inviteToMatch,
  publishMatch,
  requestToJoin,
  respondToRequest,
} from '#services/match_service'

test.group('flujo de partidos', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  async function fixtures(guestCount: number) {
    const suffix = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`
    const branch = await Branch.create({
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
      emailVerifiedAt: DateTime.now(),
    })
    const guests = Array.from({ length: guestCount }, (_, i) => ({
      name: `Invitado ${i + 1}`,
      category: 4,
      gender: 'male' as const,
    }))
    const match = await publishMatch(organizer, {
      branchId: branch.id,
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
          emailVerifiedAt: DateTime.now(),
        })
      )
    )
    return { match, players, organizer, branch }
  }

  async function statusOf(code: string) {
    const match = await findMatchByCode(code)
    return match.status
  }

  async function requestStatus(id: number) {
    const request = await MatchRequest.findOrFail(id)
    return request.status
  }

  test('con la búsqueda abierta el jugador puede salirse', async ({ assert }) => {
    const { match, players } = await fixtures(1)
    const request = await requestToJoin(players[0], match.code)
    await respondToRequest(request.id, 'accept')

    await respondToRequest(request.id, 'leave')
    assert.equal(await requestStatus(request.id), 'left')
  })

  test('con el partido completo el jugador ya no puede salirse', async ({ assert }) => {
    const { match, players } = await fixtures(2)
    const request = await requestToJoin(players[0], match.code)
    await respondToRequest(request.id, 'accept')
    assert.equal(await statusOf(match.code), 'full')

    await assert.rejects(() => respondToRequest(request.id, 'leave'), BusinessRuleError)
    assert.equal(await requestStatus(request.id), 'accepted')
  })

  test('con la búsqueda cerrada el jugador ya no puede salirse', async ({ assert }) => {
    const { match, players } = await fixtures(1)
    const request = await requestToJoin(players[0], match.code)
    await respondToRequest(request.id, 'accept')
    await closeMatch(match.code)

    await assert.rejects(() => respondToRequest(request.id, 'leave'), BusinessRuleError)
  })

  test('después de la hora del partido el jugador ya no puede salirse', async ({ assert }) => {
    const { match, players } = await fixtures(1)
    const request = await requestToJoin(players[0], match.code)
    await respondToRequest(request.id, 'accept')
    await Match.query()
      .where('id', match.id)
      .update({ starts_at: DateTime.now().minus({ hours: 2 }).toSQL() })

    await assert.rejects(() => respondToRequest(request.id, 'leave'), BusinessRuleError)
  })

  test('con la búsqueda cerrada el organizador ya no puede sacar', async ({ assert }) => {
    const { match, players } = await fixtures(1)
    const request = await requestToJoin(players[0], match.code)
    await respondToRequest(request.id, 'accept')
    await closeMatch(match.code)

    await assert.rejects(() => respondToRequest(request.id, 'remove'), BusinessRuleError)
  })

  test('después de la hora del partido el organizador ya no puede sacar', async ({ assert }) => {
    const { match, players } = await fixtures(2)
    const request = await requestToJoin(players[0], match.code)
    await respondToRequest(request.id, 'accept')
    await Match.query()
      .where('id', match.id)
      .update({ starts_at: DateTime.now().minus({ hours: 2 }).toSQL() })

    await assert.rejects(() => respondToRequest(request.id, 'remove'), BusinessRuleError)
  })

  test('al sacar un jugador de un partido completo, el puesto vuelve a abrirse', async ({
    assert,
  }) => {
    const { match, players } = await fixtures(2)
    const request = await requestToJoin(players[0], match.code)
    await respondToRequest(request.id, 'accept')

    await respondToRequest(request.id, 'remove')
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
    const { match, players, branch } = await fixtures(0)
    const otherOrganizer = await User.create({
      fullName: 'Otro Org',
      email: `otro-${Date.now()}@t.test`,
      password: 'secret123',
      category: 4,
      gender: 'male',
      emailVerifiedAt: DateTime.now(),
    })
    const overlapping = await publishMatch(otherOrganizer, {
      branchId: branch.id,
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
    const { match, players, branch } = await fixtures(0)
    const day = match.startsAt.setZone('America/Panama').startOf('day')
    const matchStart = match.startsAt
    const matchEnd = matchStart.plus({ minutes: match.durationMinutes })
    const slots = Array.from({ length: 12 }, (_, i) => day.plus({ hours: i * 2 })).filter(
      (slot) => !(slot < matchEnd && slot.plus({ minutes: 90 }) > matchStart)
    )

    for (const startsAt of slots.slice(0, MAX_MATCHES_PER_DAY)) {
      await publishMatch(players[0], {
        branchId: branch.id,
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
    const { match, players, branch } = await fixtures(0)
    await publishMatch(players[0], {
      branchId: branch.id,
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

  test('un partido expirado no bloquea unirse a otro que se cruza en horario', async ({
    assert,
  }) => {
    const { match, players, branch } = await fixtures(0)
    const expired = await publishMatch(players[0], {
      branchId: branch.id,
      courtNumber: 6,
      startsAt: DateTime.now().plus({ days: 2 }),
      durationMinutes: 90,
      category: 4,
      type: 'mixed',
      maxPlayers: 4,
      guests: [],
    })
    await Match.query()
      .where('id', expired.id)
      .update({ starts_at: DateTime.now().minus({ minutes: 30 }).toSQL() })
    await Match.query()
      .where('id', match.id)
      .update({ starts_at: DateTime.now().plus({ minutes: 30 }).toSQL() })

    const request = await requestToJoin(players[0], match.code)
    assert.equal(request.status, 'pending')
  })

  test('un usuario sin verificar no puede publicar ni pedir unirse', async ({ assert }) => {
    const { match, branch } = await fixtures(0)
    const unverified = await User.create({
      fullName: 'Sin Verificar',
      email: `nv-${Date.now()}@t.test`,
      password: 'secret123',
      category: 4,
      gender: 'male',
    })

    await assert.rejects(() => requestToJoin(unverified, match.code), EmailNotVerifiedError)
    await assert.rejects(
      () =>
        publishMatch(unverified, {
          branchId: branch.id,
          courtNumber: 7,
          startsAt: DateTime.now().plus({ days: 2 }),
          durationMinutes: 90,
          category: 4,
          type: 'mixed',
          maxPlayers: 4,
          guests: [],
        }),
      EmailNotVerifiedError
    )
  })

  test('el organizador no puede invitarse a su propio partido', async ({ assert }) => {
    const { match, organizer } = await fixtures(0)

    await assert.rejects(
      () => inviteToMatch(match.code, organizer.id),
      'No puedes invitarte a tu propio partido'
    )
  })

  test('un invitado sin verificar no puede aceptar la invitación', async ({ assert }) => {
    const { match, players } = await fixtures(0)
    const invitation = await inviteToMatch(match.code, players[0].id)
    players[0].emailVerifiedAt = null
    await players[0].save()

    await assert.rejects(() => respondToRequest(invitation.id, 'accept'), EmailNotVerifiedError)
  })

  test('el organizador no puede aprobar una solicitud previa de un jugador sin verificar', async ({
    assert,
  }) => {
    const { match, players } = await fixtures(0)
    const request = await requestToJoin(players[0], match.code)
    players[0].emailVerifiedAt = null
    await players[0].save()

    await assert.rejects(
      () => respondToRequest(request.id, 'accept'),
      'Este jugador aún no verifica su correo'
    )
  })

  test('una invitación de un partido expirado ya no aparece en mis solicitudes', async ({
    client,
    assert,
  }) => {
    const { match, players } = await fixtures(0)
    await inviteToMatch(match.code, players[0].id)

    const before = await client.get('/api/me/match-requests').loginAs(players[0])
    assert.lengthOf(before.body(), 1)

    await Match.query()
      .where('id', match.id)
      .update({ starts_at: DateTime.now().minus({ hours: 1 }).toSQL() })
    const after = await client.get('/api/me/match-requests').loginAs(players[0])
    assert.lengthOf(after.body(), 0)
  })

  test('sin sesión el lobby y el detalle no traen nombres ni ids de los jugadores', async ({
    client,
    assert,
  }) => {
    const { match, players } = await fixtures(1)
    const request = await requestToJoin(players[0], match.code)
    await respondToRequest(request.id, 'accept')

    const listing = await client.get(`/api/matches?branchId=${match.branchId}`)
    const shown = await client.get(`/api/matches/${match.code}`)
    const [listed, detail] = [listing.body()[0], shown.body()]
    for (const anonymous of [listed, detail]) {
      assert.deepEqual(anonymous.organizer, { id: 0, fullName: null })
      assert.deepEqual(
        anonymous.players.map((p: { id: number; fullName: string | null }) => [p.id, p.fullName]),
        [
          [0, null],
          [1, null],
        ]
      )
      assert.isNull(anonymous.guests[0].name)
    }

    const signedIn = await client.get(`/api/matches/${match.code}`).loginAs(players[1])
    assert.equal(signedIn.body().organizer.fullName, 'Org Test')
  })
})
