import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import Branch from '#models/branch'
import User from '#models/user'

test.group('subnivel de categoría', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  const suffix = () => `${Date.now()}${Math.random().toString(36).slice(2, 6)}`

  async function newUser() {
    return User.create({
      fullName: 'Tier Test',
      email: `tier-${suffix()}@t.test`,
      password: 'secret123',
      category: 4,
      gender: 'male',
      emailVerifiedAt: DateTime.now(),
    })
  }

  test('PATCH /me guarda, conserva al omitir y limpia con null', async ({ client, assert }) => {
    const user = await newUser()

    const saved = await client.patch('/api/me').json({ categoryTier: 'high' }).loginAs(user)
    saved.assertStatus(200)
    assert.equal(saved.body().categoryTier, 'high')

    const untouched = await client.patch('/api/me').json({ fullName: 'Otro Nombre' }).loginAs(user)
    assert.equal(untouched.body().categoryTier, 'high')

    const cleared = await client.patch('/api/me').json({ categoryTier: null }).loginAs(user)
    cleared.assertStatus(200)
    assert.isNull(cleared.body().categoryTier)
  })

  test('PATCH /me rechaza un subnivel inválido con 422', async ({ client, assert }) => {
    const user = await newUser()
    const response = await client.patch('/api/me').json({ categoryTier: 'mid' }).loginAs(user)
    response.assertStatus(422)
    assert.equal(response.body().errors[0].field, 'categoryTier')
  })

  test('POST /matches guarda el subnivel y lo devuelve', async ({ client, assert }) => {
    const user = await newUser()
    const branch = await Branch.create({
      name: 'WePadel',
      slug: `wepadel-${suffix()}`,
      phone: '+507 200-0001',
      locationLabel: 'Centennial',
      mapsUrl: 'https://maps.google.com',
      website: 'https://wepadel.com',
    })
    const response = await client
      .post('/api/matches')
      .json({
        branchId: branch.id,
        courtNumber: 3,
        startsAt: DateTime.now().plus({ days: 1 }).toISO(),
        durationMinutes: 90,
        category: 4,
        categoryTier: 'entry',
        type: 'mixed',
        maxPlayers: 4,
      })
      .loginAs(user)
    response.assertStatus(200)
    assert.equal(response.body().categoryTier, 'entry')
  })
})
