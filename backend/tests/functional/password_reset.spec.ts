import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import mail from '@adonisjs/mail/services/main'
import type BusinessRuleError from '#exceptions/business_rule_error'
import User from '#models/user'
import CodeNotification from '#mails/code_notification'
import { issueCode, verifyCode } from '#services/email_verification'
import { requestReset, resetPassword } from '#services/password_reset'

test.group('recuperar contraseña', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.teardown(() => mail.restore())

  async function newUser() {
    const suffix = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`
    return User.create({
      fullName: 'Reset Test',
      email: `r-${suffix}@t.test`,
      password: 'old-secret123',
    })
  }

  function sentCodes(mails: ReturnType<typeof mail.fake>['mails']) {
    return mails
      .queued((m) => m instanceof CodeNotification)
      .map((m) => /\d{6}/.exec(m.message.nodeMailerMessage.subject ?? '')![0])
  }

  async function rejection(promise: Promise<unknown>) {
    try {
      await promise
    } catch (error) {
      return error as BusinessRuleError
    }
    return null
  }

  test('el código correcto cambia la contraseña, verifica el correo y sube session_version', async ({
    assert,
  }) => {
    const { mails } = mail.fake()
    const user = await newUser()
    await requestReset([user.email])
    const [code] = sentCodes(mails)

    await resetPassword([user.email], code, 'new-secret123')

    await user.refresh()
    assert.isNotNull(user.emailVerifiedAt)
    assert.equal(user.sessionVersion, 1)
    assert.isNull(await User.verifyCredentials(user.email, 'old-secret123').catch(() => null))
    const logged = await User.verifyCredentials(user.email, 'new-secret123')
    assert.equal(logged.id, user.id)
  })

  test('un correo inexistente no envía nada ni da error', async ({ assert }) => {
    const { mails } = mail.fake()
    await requestReset(['nadie@t.test'])
    assert.lengthOf(sentCodes(mails), 0)
    const error = await rejection(resetPassword(['nadie@t.test'], '123456', 'new-secret123'))
    assert.equal(error?.message, 'El código no es válido o venció. Pide uno nuevo')
  })

  test('un código incorrecto no cambia la contraseña', async ({ assert }) => {
    const { mails } = mail.fake()
    const user = await newUser()
    await requestReset([user.email])
    const [code] = sentCodes(mails)
    const wrong = code === '000000' ? '000001' : '000000'

    const error = await rejection(resetPassword([user.email], wrong, 'new-secret123'))

    assert.equal(error?.message, 'El código no es válido o venció. Pide uno nuevo')
    await user.refresh()
    assert.equal(user.sessionVersion, 0)
    assert.isNull(user.emailVerifiedAt)
  })

  test('un código de verify_email no sirve para recuperar la contraseña', async ({ assert }) => {
    const { mails } = mail.fake()
    const user = await newUser()
    await issueCode(user)
    const [code] = sentCodes(mails)

    const error = await rejection(resetPassword([user.email], code, 'new-secret123'))

    assert.equal(error?.message, 'El código no es válido o venció. Pide uno nuevo')
  })

  test('un código de reset_password no sirve para verificar el correo', async ({ assert }) => {
    const { mails } = mail.fake()
    const user = await newUser()
    await requestReset([user.email])
    const [code] = sentCodes(mails)

    const error = await rejection(verifyCode(user, code))

    assert.match(error?.message ?? '', /venció/)
    await user.refresh()
    assert.isNull(user.emailVerifiedAt)
  })

  test('una sesión con session_version vieja recibe 401', async ({ client }) => {
    const user = await newUser()
    user.sessionVersion = 1
    await user.save()

    const response = await client.get('/api/me').loginAs(user)

    response.assertStatus(401)
  })

  test('una sesión con la session_version vigente entra', async ({ client }) => {
    const user = await newUser()
    user.sessionVersion = 1
    await user.save()

    const response = await client.get('/api/me').withSession({ session_version: 1 }).loginAs(user)

    response.assertStatus(200)
  })
})
