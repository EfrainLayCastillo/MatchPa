import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import Availability from '#models/availability'
import Branch from '#models/branch'
import User from '#models/user'
import { PANAMA_ZONE } from '#services/panama_time'

test.group('disponibilidad: sucursal obligatoria', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  const date = DateTime.now().setZone(PANAMA_ZONE).plus({ days: 3 }).toISODate()!

  function newBranch(name: string) {
    const suffix = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`
    return Branch.create({
      name,
      slug: `${name}-${suffix}`,
      phone: '+507 200-0001',
      locationLabel: 'Centennial',
      mapsUrl: 'https://maps.google.com',
      website: 'https://example.com',
    })
  }

  function newPlayer(label: string) {
    return User.create({
      fullName: `Jugador ${label}`,
      email: `${label}-${Date.now()}${Math.random().toString(36).slice(2, 6)}@t.test`,
      password: 'secret123',
      category: 4,
      gender: 'male',
      emailVerifiedAt: DateTime.now(),
    })
  }

  test('guardar disponibilidad sin sucursal responde 422', async ({ client }) => {
    const user = await newPlayer('sin-sucursal')

    const missing = await client
      .put(`/api/me/availabilities/${date}`)
      .json({ fromTime: null, toTime: null })
      .loginAs(user)
    missing.assertStatus(422)

    const explicitNull = await client
      .put(`/api/me/availabilities/${date}`)
      .json({ fromTime: null, toTime: null, branchId: null })
      .loginAs(user)
    explicitNull.assertStatus(422)
  })

  test('guardar disponibilidad con una sucursal inexistente responde 422', async ({ client }) => {
    const user = await newPlayer('sucursal-falsa')
    const response = await client
      .put(`/api/me/availabilities/${date}`)
      .json({ fromTime: null, toTime: null, branchId: 999999999 })
      .loginAs(user)
    response.assertStatus(422)
  })

  test('/players con branchId no incluye disponibilidades de otra sucursal', async ({
    client,
    assert,
  }) => {
    const [mine, other] = await Promise.all([newBranch('mine'), newBranch('other')])
    const [viewer, inMine, inOther] = await Promise.all([
      newPlayer('viewer'),
      newPlayer('in-mine'),
      newPlayer('in-other'),
    ])
    const day = DateTime.fromISO(date, { zone: PANAMA_ZONE })
    await Availability.createMany([
      { userId: inMine.id, date: day, branchId: mine.id },
      { userId: inOther.id, date: day, branchId: other.id },
    ])

    const response = await client
      .get('/api/players')
      .qs({ date, branchId: mine.id })
      .loginAs(viewer)
    response.assertStatus(200)
    const names = response.body().map((slot: { fullName: string }) => slot.fullName)
    assert.deepEqual(names, ['Jugador in-mine'])
  })
})
