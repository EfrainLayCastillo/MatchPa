import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import BranchSuggestion from '#models/branch_suggestion'
import User from '#models/user'

test.group('sugerir sucursal', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  const payload = { name: 'Club Nuevo', locationLabel: 'Costa del Este' }

  function newUser() {
    return User.create({
      fullName: 'Sugeridor',
      email: `sug-${Date.now()}${Math.random().toString(36).slice(2, 6)}@t.test`,
      password: 'secret123',
      emailVerifiedAt: DateTime.now(),
    })
  }

  test('una segunda sugerencia pendiente del mismo usuario responde 409', async ({
    client,
    assert,
  }) => {
    const user = await newUser()
    const first = await client.post('/api/branch-suggestions').json(payload).loginAs(user)
    first.assertStatus(201)
    first.assertBodyContains({ name: 'Club Nuevo', status: 'pending', mapsUrl: null })

    const second = await client.post('/api/branch-suggestions').json(payload).loginAs(user)
    second.assertStatus(409)
    assert.equal(
      second.body().message ?? second.body().errors?.[0]?.message,
      'Ya tienes una sugerencia en revisión'
    )
  })

  test('con la primera sugerencia rechazada se permite otra', async ({ client }) => {
    const user = await newUser()
    await BranchSuggestion.create({ userId: user.id, ...payload, status: 'rejected' })

    const response = await client.post('/api/branch-suggestions').json(payload).loginAs(user)
    response.assertStatus(201)
  })
})
