import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import type { ApiClient } from '@japa/api-client'
import { DateTime } from 'luxon'
import Branch from '#models/branch'
import Notification from '#models/notification'
import User from '#models/user'
import { deleteAccount } from '#services/account_deletion'
import {
  findMatchByCode,
  publishMatch,
  requestToJoin,
  respondToRequest,
} from '#services/match_service'
import { notifyMatchFilled, notifyRequestCreated } from '#services/notifications'

test.group('bandeja de notificaciones', (group) => {
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

  async function publish(organizer: User, guests = 2) {
    const branch = await Branch.create({
      name: 'WePadel',
      slug: `wepadel-${suffix()}`,
      phone: '+507 200-0001',
      locationLabel: 'Centennial',
      mapsUrl: 'https://maps.google.com',
      website: 'https://wepadel.com',
    })
    return publishMatch(organizer, {
      branchId: branch.id,
      courtNumber: 1,
      startsAt: DateTime.now().plus({ days: 2 }),
      durationMinutes: 90,
      category: 4,
      type: 'mixed',
      maxPlayers: 4,
      guests: Array.from({ length: guests }, (_, i) => ({
        name: `G${i}`,
        category: 4,
        gender: 'male' as const,
      })),
    })
  }

  async function inboxOf(client: ApiClient, user: User) {
    const response = await client.get('/api/notifications').loginAs(user)
    return response.body()
  }

  async function requestAndNotify(player: User, code: string) {
    const request = await requestToJoin(player, code)
    await notifyRequestCreated(await findMatchByCode(code), request)
    return request
  }

  test('al pedir unirse, el organizador recibe join_requested y el solicitante nada', async ({
    assert,
  }) => {
    const organizer = await newUser('org')
    const player = await newUser('pl')
    const match = await publish(organizer)

    await requestAndNotify(player, match.code)

    const mine = await Notification.query().where('user_id', organizer.id)
    assert.deepEqual(
      mine.map((item) => item.type),
      ['join_requested']
    )
    assert.lengthOf(await Notification.query().where('user_id', player.id), 0)
  })

  test('GET /notifications devuelve solo las del usuario autenticado', async ({
    client,
    assert,
  }) => {
    const organizer = await newUser('org')
    const player = await newUser('pl')
    const match = await publish(organizer)
    await requestAndNotify(player, match.code)

    const response = await client.get('/api/notifications').loginAs(organizer)
    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.items.length, 1)
    assert.equal(body.items[0].type, 'join_requested')
    assert.equal(body.items[0].match.code, match.code)
    assert.equal(body.items[0].match.branchName, 'WePadel')
    assert.equal(body.items[0].match.courtNumber, 1)

    const other = await client.get('/api/notifications').loginAs(player)
    assert.deepEqual(other.body(), { unreadCount: 0, items: [] })
  })

  test('unreadCount cuenta las posteriores a notifications_read_at y read lo deja en 0', async ({
    client,
    assert,
  }) => {
    const organizer = await newUser('org')
    const match = await publish(organizer)
    const old = await Notification.create({
      userId: organizer.id,
      matchId: match.id,
      type: 'player_left',
    })
    old.createdAt = DateTime.now().minus({ hours: 2 })
    await old.save()
    await Notification.create({ userId: organizer.id, matchId: match.id, type: 'join_requested' })
    organizer.notificationsReadAt = DateTime.now().minus({ hours: 1 })
    await organizer.save()

    const before = await inboxOf(client, organizer)
    assert.equal(before.unreadCount, 1)
    assert.deepEqual(
      before.items.map((item: { unread: boolean }) => item.unread),
      [true, false]
    )

    const read = await client.post('/api/notifications/read').loginAs(organizer)
    read.assertStatus(204)
    const after = await inboxOf(client, organizer)
    assert.equal(after.unreadCount, 0)
  })

  test('sin notifications_read_at todas cuentan como no leídas', async ({ client, assert }) => {
    const organizer = await newUser('org')
    const match = await publish(organizer)
    await Notification.createMany([
      { userId: organizer.id, matchId: match.id, type: 'join_requested' },
      { userId: organizer.id, matchId: match.id, type: 'player_left' },
    ])

    const body = await inboxOf(client, organizer)
    assert.equal(body.unreadCount, 2)
  })

  test('no lista las de hace más de 30 días', async ({ client, assert }) => {
    const organizer = await newUser('org')
    const match = await publish(organizer)
    const stale = await Notification.create({
      userId: organizer.id,
      matchId: match.id,
      type: 'join_requested',
    })
    stale.createdAt = DateTime.now().minus({ days: 31 })
    await stale.save()

    const body = await inboxOf(client, organizer)
    assert.deepEqual(body, { unreadCount: 0, items: [] })
  })

  test('al borrar la cuenta se borran sus notificaciones', async ({ assert }) => {
    const organizer = await newUser('org')
    const player = await newUser('pl')
    const match = await publish(organizer)
    await Notification.create({ userId: player.id, matchId: match.id, type: 'invited' })

    await deleteAccount(player)

    assert.lengthOf(await Notification.query().where('user_id', player.id), 0)
  })

  test('al llenarse el partido, los aceptados reciben match_filled', async ({ assert }) => {
    const organizer = await newUser('org')
    const first = await newUser('p1')
    const second = await newUser('p2')
    const match = await publish(organizer, 1)
    const firstRequest = await requestToJoin(first, match.code)
    const secondRequest = await requestToJoin(second, match.code)
    await respondToRequest(firstRequest.id, 'accept')
    const { match: filledMatch, filled } = await respondToRequest(secondRequest.id, 'accept')
    assert.isTrue(filled)

    await notifyMatchFilled(filledMatch, [second.id])

    const typesFor = async (user: User) => {
      const rows = await Notification.query().where('user_id', user.id)
      return rows.map((item) => item.type)
    }
    assert.deepEqual(await typesFor(first), ['match_filled'])
    assert.deepEqual(await typesFor(organizer), ['match_filled'])
    assert.deepEqual(await typesFor(second), [])
  })
})
