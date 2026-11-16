import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import env from '#start/env'
import User from '#models/user'

const SECRET = 'test-proxy-secret'

test.group('endurecimiento', (group) => {
  group.each.setup(async () => {
    env.set('PROXY_SECRET', SECRET)
    return testUtils.db().wrapInGlobalTransaction()
  })
  group.each.teardown(() => env.set('PROXY_SECRET', ''))

  const login = (client: any, headers: Record<string, string>) =>
    client.post('/api/auth/login').headers(headers).json({ email: 'x@t.test', password: 'bad' })

  async function exhaust(client: any, headers: (n: number) => Record<string, string>) {
    let last = 0
    for (let attempt = 0; attempt < 11; attempt++) {
      const response = await login(client, headers(attempt))
      last = response.status()
    }
    return last
  }

  test('con secreto correcto, cada x-client-ip tiene su propio cubo de auth', async ({
    client,
    assert,
  }) => {
    assert.equal(
      await exhaust(client, () => ({ 'x-proxy-secret': SECRET, 'x-client-ip': '203.0.113.7' })),
      429
    )
    const other = await login(client, { 'x-proxy-secret': SECRET, 'x-client-ip': '203.0.113.8' })
    assert.notEqual(other.status(), 429)
  })

  test('con secreto incorrecto, x-client-ip se ignora y comparten cubo', async ({
    client,
    assert,
  }) => {
    const last = await exhaust(client, (n) => ({
      'x-proxy-secret': 'wrong',
      'x-client-ip': `203.0.113.${n + 20}`,
    }))
    assert.equal(last, 429)
  })

  test('branchId inexistente responde 422', async ({ client }) => {
    const user = await User.create({
      fullName: 'Org Test',
      email: `org-${Date.now()}@t.test`,
      password: 'secret123',
      category: 4,
      gender: 'male',
      emailVerifiedAt: DateTime.now(),
    })
    const response = await client
      .post('/api/matches')
      .json({
        branchId: 999999,
        courtNumber: 1,
        startsAt: DateTime.now().plus({ days: 1 }).toISO(),
        durationMinutes: 90,
        category: 4,
        type: 'male',
        maxPlayers: 4,
      })
      .loginAs(user)
    response.assertStatus(422)
  })

  test('login por formulario urlencoded no autentica', async ({ client, assert }) => {
    const user = await User.create({
      fullName: 'Form Test',
      email: `form-${Date.now()}@t.test`,
      password: 'secret123',
      emailVerifiedAt: DateTime.now(),
    })
    const response = await client
      .post('/api/auth/login')
      .form({ email: user.email, password: 'secret123' })
    assert.include([415, 422], response.status())
  })
})
