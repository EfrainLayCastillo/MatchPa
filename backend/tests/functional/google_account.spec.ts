import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import User from '#models/user'
import { findOrLinkGoogleUser, type GoogleProfile } from '#services/google_account'

test.group('login con Google', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  const suffix = () => `${Date.now()}${Math.random().toString(36).slice(2, 6)}`

  function passwordUser(email: string, verified: boolean) {
    return User.create({
      fullName: 'Cuenta Correo',
      email,
      password: 'secret1234',
      emailVerifiedAt: verified ? DateTime.now() : null,
    })
  }

  function googleProfile(email: string, verified = true): GoogleProfile {
    return {
      id: `g-${suffix()}`,
      email,
      name: 'Cuenta Google',
      avatarUrl: null,
      emailVerificationState: verified ? 'verified' : 'unverified',
    }
  }

  test('vincula Google a la cuenta con el correo verificado', async ({ assert }) => {
    const email = `link${suffix()}@gmail.com`
    const existing = await passwordUser(email, true)
    const profile = googleProfile(email)

    const user = await findOrLinkGoogleUser(profile)

    assert.equal(user?.id, existing.id)
    await existing.refresh()
    assert.equal(existing.googleId, profile.id)
    const again = await findOrLinkGoogleUser(profile)
    assert.equal(again?.id, existing.id)
  })

  test('no vincula si la cuenta no verificó su correo', async ({ assert }) => {
    const email = `noverif${suffix()}@gmail.com`
    const existing = await passwordUser(email, false)

    assert.isNull(await findOrLinkGoogleUser(googleProfile(email)))
    await existing.refresh()
    assert.isNull(existing.googleId)
  })

  test('no vincula si Google no reporta el correo verificado', async ({ assert }) => {
    const email = `gnoverif${suffix()}@gmail.com`
    await passwordUser(email, true)

    assert.isNull(await findOrLinkGoogleUser(googleProfile(email, false)))
  })

  test('reconoce la variante de Gmail con puntos de una cuenta registrada', async ({ assert }) => {
    const local = `juanperez${suffix()}`
    const existing = await passwordUser(`${local}@gmail.com`, true)
    const dotted = `${local.slice(0, 4)}.${local.slice(4)}@gmail.com`

    const user = await findOrLinkGoogleUser(googleProfile(dotted))
    assert.equal(user?.id, existing.id)
  })

  test('no reemplaza otro Google ya vinculado a la cuenta', async ({ assert }) => {
    const email = `taken${suffix()}@gmail.com`
    const existing = await passwordUser(email, true)
    existing.googleId = `g-original-${suffix()}`
    await existing.save()

    assert.isNull(await findOrLinkGoogleUser(googleProfile(email)))
  })

  test('no vincula un correo ajeno a Gmail sin dominio de Workspace', async ({ assert }) => {
    const email = `empresa${suffix()}@empresa.test`
    await passwordUser(email, true)

    assert.isNull(await findOrLinkGoogleUser(googleProfile(email)))
    const workspace = { ...googleProfile(email), original: { hd: 'empresa.test' } }
    assert.isNotNull(await findOrLinkGoogleUser(workspace))
  })

  test('crea la cuenta verificada si el correo es nuevo', async ({ assert }) => {
    const user = await findOrLinkGoogleUser(googleProfile(`nuevo${suffix()}@gmail.com`))

    assert.isNotNull(user?.emailVerifiedAt)
  })
})
