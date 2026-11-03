import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import User from '#models/user'

test.group('límites por cuenta', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('publicar más de 10 veces en una hora responde 429', async ({ client }) => {
    const user = await User.create({
      fullName: 'Spammer',
      email: `spam-${Date.now()}@t.test`,
      password: 'secret123',
      emailVerifiedAt: DateTime.now(),
    })

    for (let attempt = 0; attempt < 10; attempt++) {
      const response = await client.post('/api/matches').json({}).loginAs(user)
      response.assertStatus(422)
    }
    const blocked = await client.post('/api/matches').json({}).loginAs(user)
    blocked.assertStatus(429)
  })
})
