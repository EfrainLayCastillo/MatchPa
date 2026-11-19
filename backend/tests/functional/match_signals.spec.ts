import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import Branch from '#models/branch'
import type Match from '#models/match'
import MatchSignal from '#models/match_signal'
import Notification from '#models/notification'
import User from '#models/user'
import { deleteAccount } from '#services/account_deletion'
import {
  findMatchByCode,
  publishMatch,
  requestToJoin,
  respondToRequest,
} from '#services/match_service'
import { notifySignal } from '#services/notifications'

function assertStatus(response: { assertStatus: (status: number) => void }, status: number) {
  response.assertStatus(status)
}

test.group('señales del partido', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  const suffix = () => `${Date.now()}${Math.random().toString(36).slice(2, 6)}`

  async function newUser(label: string) {
    return User.create({
      fullName: label,
      email: `${label}-${suffix()}@t.test`,
      password: 'secret123',
      category: 4,
      categoryTier: 'high',
      gender: 'male',
      emailVerifiedAt: DateTime.now(),
    })
  }

  async function setup(startsInMinutes = 30) {
    const organizer = await newUser('org')
    const player = await newUser('pl')
    const outsider = await newUser('out')
    const branch = await Branch.create({
      name: 'WePadel',
      slug: `wepadel-${suffix()}`,
      phone: '+507 200-0001',
      locationLabel: 'Centennial',
      mapsUrl: 'https://maps.google.com',
      website: 'https://wepadel.com',
    })
    const match = await publishMatch(organizer, {
      branchId: branch.id,
      courtNumber: 1,
      startsAt: DateTime.now().plus({ days: 2 }),
      durationMinutes: 90,
      category: 4,
      type: 'mixed',
      maxPlayers: 4,
      guests: [{ name: 'G', category: 4, gender: 'male' as const }],
    })
    const request = await requestToJoin(player, match.code)
    await respondToRequest(request.id, 'accept')
    await moveStart(match, startsInMinutes)
    return { organizer, player, outsider, match }
  }

  async function moveStart(match: Match, minutesFromNow: number) {
    match.startsAt = DateTime.now().plus({ minutes: minutesFromNow })
    await match.save()
  }

  test('la ventana va de 60 minutos antes a 15 después', async ({ client }) => {
    const { player, match } = await setup(61)
    const send = (kind: string) =>
      client.post(`/api/matches/${match.code}/signals`).loginAs(player).json({ kind })

    assertStatus(await send('arrived'), 422)
    await moveStart(match, 59)
    assertStatus(await send('arrived'), 201)
    await moveStart(match, -14)
    assertStatus(await send('running_late'), 201)
    await moveStart(match, -16)
    assertStatus(await send('on_the_way'), 422)
  })

  test('cada señal se manda una sola vez por usuario', async ({ client }) => {
    const { player, match } = await setup()
    const send = () =>
      client.post(`/api/matches/${match.code}/signals`).loginAs(player).json({ kind: 'arrived' })

    const first = await send()
    first.assertStatus(201)
    first.assertBodyContains({ userId: player.id, fullName: 'pl', kind: 'arrived' })
    assertStatus(await send(), 409)
  })

  test('quien no está en el partido recibe 403', async ({ client }) => {
    const { outsider, match } = await setup()
    const response = await client
      .post(`/api/matches/${match.code}/signals`)
      .loginAs(outsider)
      .json({ kind: 'arrived' })
    response.assertStatus(403)
  })

  test('el organizador no manda on_the_way pero sí arrived', async ({ client }) => {
    const { organizer, match } = await setup()
    const send = (kind: string) =>
      client.post(`/api/matches/${match.code}/signals`).loginAs(organizer).json({ kind })

    assertStatus(await send('on_the_way'), 422)
    assertStatus(await send('arrived'), 201)
  })

  test('un partido cerrado no admite señales', async ({ client }) => {
    const { player, match } = await setup()
    match.status = 'closed'
    await match.save()
    const response = await client
      .post(`/api/matches/${match.code}/signals`)
      .loginAs(player)
      .json({ kind: 'arrived' })
    response.assertStatus(422)
  })

  test('signals solo se ve para el organizador y los aceptados', async ({ client, assert }) => {
    const { organizer, player, outsider, match } = await setup()
    await client
      .post(`/api/matches/${match.code}/signals`)
      .loginAs(player)
      .json({ kind: 'on_the_way' })

    const asOrganizer = await client.get(`/api/matches/${match.code}`).loginAs(organizer)
    const asPlayer = await client.get(`/api/matches/${match.code}`).loginAs(player)
    const asOutsider = await client.get(`/api/matches/${match.code}`).loginAs(outsider)
    const anonymous = await client.get(`/api/matches/${match.code}`)

    assert.equal(asOrganizer.body().signals[0].fullName, 'pl')
    assert.equal(asPlayer.body().signals[0].kind, 'on_the_way')
    assert.deepEqual(asOutsider.body().signals, [])
    assert.deepEqual(anonymous.body().signals, [])
  })

  test('la bandeja del organizador guarda una sola fila de señal por partido', async ({
    assert,
  }) => {
    const { organizer, player, match } = await setup()
    const loaded = await findMatchByCode(match.code)

    await notifySignal(loaded, player, 'on_the_way')
    await notifySignal(loaded, player, 'arrived')

    const rows = await Notification.query().where('user_id', organizer.id)
    assert.deepEqual(
      rows.map((row) => row.type),
      ['signal_arrived']
    )
  })

  test('la señal del organizador no notifica', async ({ client, assert }) => {
    const { organizer, player, match } = await setup()
    await client
      .post(`/api/matches/${match.code}/signals`)
      .loginAs(organizer)
      .json({ kind: 'arrived' })

    const rows = await Notification.query().whereIn('user_id', [organizer.id, player.id])
    assert.lengthOf(
      rows.filter((row) => row.type.startsWith('signal_')),
      0
    )
  })

  test('eliminar la cuenta borra sus señales', async ({ client, assert }) => {
    const { player, match } = await setup()
    await client
      .post(`/api/matches/${match.code}/signals`)
      .loginAs(player)
      .json({ kind: 'arrived' })

    await deleteAccount(player)

    assert.lengthOf(await MatchSignal.query().where('user_id', player.id), 0)
  })
})
