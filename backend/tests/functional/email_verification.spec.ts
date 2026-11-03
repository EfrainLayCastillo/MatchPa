import { test } from '@japa/runner'
import type { HttpContext } from '@adonisjs/core/http'
import testUtils from '@adonisjs/core/services/test_utils'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'
import type BusinessRuleError from '#exceptions/business_rule_error'
import EmailVerification from '#models/email_verification'
import User from '#models/user'
import VerifyEmailNotification from '#mails/verify_email_notification'
import AuthController from '#controllers/auth_controller'
import { MAX_ATTEMPTS, issueCode, verifyCode } from '#services/email_verification'

test.group('verificación de correo', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function newUserWithCode() {
    const { mails } = mail.fake()
    const suffix = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`
    const user = await User.create({
      fullName: 'Verif Test',
      email: `v-${suffix}@t.test`,
      password: 'secret123',
    })
    await issueCode(user)
    const sent = mails.queued((m) => m instanceof VerifyEmailNotification)
    const code = /\d{6}/.exec(sent[0].message.nodeMailerMessage.subject ?? '')![0]
    return { user, code, sent, restore: () => mail.restore() }
  }

  async function rejection(promise: Promise<void>) {
    try {
      await promise
    } catch (error) {
      return error as BusinessRuleError
    }
    return null
  }

  test('issueCode envía un correo con el código de 6 dígitos', async ({ assert }) => {
    const { sent, code, restore } = await newUserWithCode()
    assert.lengthOf(sent, 1)
    assert.match(code, /^\d{6}$/)
    restore()
  })

  test('el código correcto verifica y borra la fila', async ({ assert }) => {
    const { user, code, restore } = await newUserWithCode()
    await verifyCode(user, code)
    await user.refresh()
    assert.isNotNull(user.emailVerifiedAt)
    assert.isNull(await EmailVerification.findBy('userId', user.id))
    restore()
  })

  test('el código incorrecto suma un intento', async ({ assert }) => {
    const { user, code, restore } = await newUserWithCode()
    const wrong = code === '000000' ? '000001' : '000000'
    const error = await rejection(verifyCode(user, wrong))
    assert.equal(error?.message, 'Código incorrecto')
    const row = await EmailVerification.findByOrFail('userId', user.id)
    assert.equal(row.attempts, 1)
    restore()
  })

  test('el intento extra falla aunque el código sea correcto', async ({ assert }) => {
    const { user, code, restore } = await newUserWithCode()
    const wrong = code === '000000' ? '000001' : '000000'
    for (let i = 0; i < MAX_ATTEMPTS; i++) await rejection(verifyCode(user, wrong))
    const error = await rejection(verifyCode(user, code))
    assert.equal(error?.message, 'El código venció o se agotaron los intentos. Pide uno nuevo')
    await user.refresh()
    assert.isNull(user.emailVerifiedAt)
    restore()
  })

  test('un código vencido falla', async ({ assert }) => {
    const { user, code, restore } = await newUserWithCode()
    await EmailVerification.query()
      .where('userId', user.id)
      .update({ expiresAt: DateTime.now().minus({ minutes: 1 }).toSQL() })
    const error = await rejection(verifyCode(user, code))
    assert.equal(error?.message, 'El código venció o se agotaron los intentos. Pide uno nuevo')
    restore()
  })

  test('si ya está verificado no hace nada', async ({ assert }) => {
    const { user, restore } = await newUserWithCode()
    user.emailVerifiedAt = DateTime.now()
    await user.save()
    assert.isNull(await rejection(verifyCode(user, '999999')))
    restore()
  })

  test('reenviar invalida el código anterior y el nuevo verifica', async ({ assert }) => {
    const { user, code: oldCode, restore } = await newUserWithCode()
    mail.restore()
    const { mails } = mail.fake()
    await issueCode(user)
    const sent = mails.queued((m) => m instanceof VerifyEmailNotification)
    const newCode = /\d{6}/.exec(sent[0].message.nodeMailerMessage.subject ?? '')![0]
    if (newCode !== oldCode) {
      const error = await rejection(verifyCode(user, oldCode))
      assert.equal(error?.message, 'Código incorrecto')
    }
    await verifyCode(user, newCode)
    await user.refresh()
    assert.isNotNull(user.emailVerifiedAt)
    restore()
  })

  test('un usuario verificado no recibe correo al reenviar', async ({ assert }) => {
    const { user, restore } = await newUserWithCode()
    mail.restore()
    const { mails } = mail.fake()
    user.emailVerifiedAt = DateTime.now()
    await user.save()
    await new AuthController().resendEmailCode({
      auth: { getUserOrFail: () => user },
      response: { noContent: () => null },
    } as unknown as HttpContext)
    assert.lengthOf(
      mails.queued((m) => m instanceof VerifyEmailNotification),
      0
    )
    restore()
  })
})
