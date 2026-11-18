import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import PushSubscription from '#models/push_subscription'
import User from '#models/user'

test.group('suscripciones push', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  const endpoint = () => `https://fcm.googleapis.com/fcm/send/${Date.now()}:APA91bTest`

  async function newUser() {
    return User.create({
      fullName: 'Push Test',
      email: `push-${Date.now()}${Math.random().toString(36).slice(2, 6)}@t.test`,
      password: 'secret123',
      category: 4,
      gender: 'male',
      emailVerifiedAt: DateTime.now(),
    })
  }

  test('guarda la suscripción del dispositivo con sus claves', async ({ client, assert }) => {
    const user = await newUser()
    const url = endpoint()
    const response = await client
      .post('/api/push-subscriptions')
      .json({ endpoint: url, expirationTime: null, keys: { p256dh: 'p256-key', auth: 'auth-key' } })
      .loginAs(user)

    response.assertStatus(204)
    const saved = await PushSubscription.findByOrFail('endpoint', url)
    assert.equal(saved.userId, user.id)
    assert.equal(saved.p256dh, 'p256-key')
  })

  test('rechaza endpoints fuera de los servicios de push', async ({ client }) => {
    const response = await client
      .post('/api/push-subscriptions')
      .json({ endpoint: 'https://evil.test/hook', keys: { p256dh: 'a', auth: 'b' } })
      .loginAs(await newUser())

    response.assertStatus(422)
  })
})
