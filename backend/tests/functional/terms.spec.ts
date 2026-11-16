import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import User from '#models/user'
import { acceptTerms, TERMS_VERSION } from '#services/terms'
import { deleteAccount } from '#services/account_deletion'

test.group('consentimiento de términos', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  const newEmail = () => `terms-${Date.now()}${Math.random().toString(36).slice(2, 6)}@t.test`
  const payload = (email: string) => ({ fullName: 'Terms Test', email, password: 'secret123' })

  test('el registro sin acceptTerms responde 422 y no crea la cuenta', async ({
    client,
    assert,
  }) => {
    const email = newEmail()
    const response = await client.post('/api/auth/register').json(payload(email))
    response.assertStatus(422)
    assert.isNull(await User.findBy('email', email))
  })

  test('el registro con aceptación guarda fecha y versión', async ({ client, assert }) => {
    const email = newEmail()
    const response = await client
      .post('/api/auth/register')
      .json({ ...payload(email), acceptTerms: true })
    response.assertStatus(200)
    assert.isTrue(response.body().termsAccepted)
    const user = await User.findByOrFail('email', email)
    assert.equal(user.termsVersion, TERMS_VERSION)
    assert.isNotNull(user.termsAcceptedAt)
  })

  test('una versión vieja aparece como no aceptada en GET /me', async ({ client, assert }) => {
    const user = await User.create({
      ...payload(newEmail()),
      termsAcceptedAt: DateTime.utc(),
      termsVersion: '2020-01-01',
    })
    const response = await client.get('/api/me').loginAs(user)
    assert.isFalse(response.body().termsAccepted)
  })

  test('POST /me/terms acepta la versión vigente', async ({ client, assert }) => {
    const user = await User.create(payload(newEmail()))
    const response = await client.post('/api/me/terms').loginAs(user)
    response.assertStatus(200)
    assert.isTrue(response.body().termsAccepted)
    await user.refresh()
    assert.equal(user.termsVersion, TERMS_VERSION)
  })

  test('eliminar la cuenta conserva la prueba del consentimiento', async ({ assert }) => {
    const user = new User().merge(payload(newEmail()))
    acceptTerms(user)
    await user.save()
    await deleteAccount(user)
    await user.refresh()
    assert.equal(user.termsVersion, TERMS_VERSION)
    assert.isNotNull(user.termsAcceptedAt)
  })
})
