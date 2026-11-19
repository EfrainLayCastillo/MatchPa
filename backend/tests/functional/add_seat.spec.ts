import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import BusinessRuleError from '#exceptions/business_rule_error'
import Branch from '#models/branch'
import Match from '#models/match'
import User from '#models/user'
import { addSeat, publishMatch } from '#services/match_service'

test.group('sumar un puesto', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  const suffix = () => `${Date.now()}${Math.random().toString(36).slice(2, 6)}`

  const newUser = (label: string) =>
    User.create({
      fullName: `Puesto ${label}`,
      email: `${label}-${suffix()}@t.test`,
      password: 'secret123',
      category: 4,
      gender: 'male',
      emailVerifiedAt: DateTime.now(),
    })

  async function setup(maxPlayers: number, guestCount: number) {
    const branch = await Branch.create({
      name: 'WePadel',
      slug: `wepadel-${suffix()}`,
      phone: '+507 200-0001',
      locationLabel: 'Centennial',
      mapsUrl: 'https://maps.google.com',
      website: 'https://wepadel.com',
    })
    const organizer = await newUser('org')
    const match = await publishMatch(organizer, {
      branchId: branch.id,
      courtNumber: null,
      startsAt: DateTime.now().plus({ days: 1 }),
      durationMinutes: 90,
      category: 4,
      type: 'mixed',
      maxPlayers,
      guests: Array.from({ length: guestCount }, (_, i) => ({
        name: `Invitado ${i}`,
        category: 4,
        gender: 'male' as const,
      })),
    })
    return { organizer, match }
  }

  test('un partido completo sube el máximo en 1 y vuelve a abrirse', async ({ assert }) => {
    const { match } = await setup(4, 3)
    assert.equal(match.status, 'full')

    const updated = await addSeat(match.code)
    assert.equal(updated.maxPlayers, 5)
    assert.equal(updated.status, 'open')
  })

  test('no se suma un puesto a un partido abierto', async ({ assert }) => {
    const { match } = await setup(4, 1)
    await assert.rejects(
      () => addSeat(match.code),
      'Solo puedes sumar un puesto a un partido completo'
    )
  })

  test('no se suma un puesto a un partido cerrado ni vencido', async ({ assert }) => {
    const closed = await setup(4, 3)
    await Match.query().where('id', closed.match.id).update({ status: 'closed' })
    await assert.rejects(() => addSeat(closed.match.code), BusinessRuleError)

    const expired = await setup(4, 3)
    await Match.query()
      .where('id', expired.match.id)
      .update({ starts_at: DateTime.now().minus({ hours: 1 }).toSQL() })
    await assert.rejects(() => addSeat(expired.match.code), BusinessRuleError)
  })

  test('el máximo no pasa de 6 jugadores', async ({ assert }) => {
    const { match } = await setup(6, 5)
    assert.equal(match.status, 'full')
    await assert.rejects(() => addSeat(match.code), 'El partido ya tiene el máximo de 6 jugadores')
  })

  test('el organizador recibe el partido actualizado', async ({ client }) => {
    const { organizer, match } = await setup(4, 3)
    const response = await client.post(`/api/matches/${match.code}/seats`).loginAs(organizer)
    response.assertStatus(200)
    response.assertBodyContains({ code: match.code, status: 'open', maxPlayers: 5 })
  })

  test('solo el organizador puede sumar un puesto', async ({ client }) => {
    const { match } = await setup(4, 3)
    const stranger = await newUser('otro')
    const response = await client.post(`/api/matches/${match.code}/seats`).loginAs(stranger)
    response.assertStatus(403)
  })

  test('la API responde 422 si el partido no está completo', async ({ client }) => {
    const { organizer, match } = await setup(4, 1)
    const response = await client.post(`/api/matches/${match.code}/seats`).loginAs(organizer)
    response.assertStatus(422)
  })
})
