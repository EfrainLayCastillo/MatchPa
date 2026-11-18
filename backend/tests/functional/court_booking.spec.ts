import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import Branch from '#models/branch'
import Match from '#models/match'
import User from '#models/user'
import {
  confirmBooking,
  publishMatch,
  requestToJoin,
  respondToRequest,
  updateMatch,
} from '#services/match_service'

test.group('reserva de cancha', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  const suffix = () => `${Date.now()}${Math.random().toString(36).slice(2, 6)}`

  const newUser = (label: string) =>
    User.create({
      fullName: `Reserva ${label}`,
      email: `${label}-${suffix()}@t.test`,
      password: 'secret123',
      category: 4,
      gender: 'male',
      emailVerifiedAt: DateTime.now(),
    })

  async function setup(guestCount = 0) {
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
      maxPlayers: 4,
      guests: Array.from({ length: guestCount }, (_, i) => ({
        name: `Invitado ${i}`,
        category: 4,
        gender: 'male' as const,
      })),
    })
    return { branch, organizer, match }
  }

  const matchBody = (branchId: number, extra: Record<string, unknown>) => ({
    branchId,
    startsAt: DateTime.now().plus({ days: 1 }).toISO(),
    durationMinutes: 90,
    category: 4,
    type: 'mixed',
    maxPlayers: 4,
    ...extra,
  })

  test('publicar sin reserva guarda la cancha nula', async ({ client, assert }) => {
    const { branch, organizer } = await setup()
    const response = await client
      .post('/api/matches')
      .json(matchBody(branch.id, { courtBooked: false, courtNumber: 4 }))
      .loginAs(organizer)
    response.assertStatus(200)
    assert.isFalse(response.body().courtBooked)
    assert.isNull(response.body().courtNumber)
  })

  test('publicar como reservado sin número responde 422', async ({ client, assert }) => {
    const { branch, organizer } = await setup()
    const response = await client
      .post('/api/matches')
      .json(matchBody(branch.id, { courtBooked: true, courtNumber: null }))
      .loginAs(organizer)
    response.assertStatus(422)
    assert.equal(response.body().errors[0].field, 'courtNumber')
  })

  test('editar conserva la hora de reserva mientras siga reservada', async ({ client, assert }) => {
    const { branch, organizer, match } = await setup()
    await client
      .post(`/api/matches/${match.code}/booking`)
      .json({ courtNumber: 2 })
      .loginAs(organizer)
    const { courtBookedAt: before } = await Match.findOrFail(match.id)

    const response = await client
      .patch(`/api/matches/${match.code}`)
      .json(matchBody(branch.id, { courtBooked: true, courtNumber: 5 }))
      .loginAs(organizer)
    response.assertStatus(200)
    assert.equal(response.body().courtNumber, 5)
    const after = await Match.findOrFail(match.id)
    assert.equal(after.courtBookedAt?.toMillis(), before?.toMillis())
  })

  test('solo el organizador puede confirmar la reserva', async ({ client }) => {
    const { match } = await setup()
    const stranger = await newUser('otro')
    const response = await client
      .post(`/api/matches/${match.code}/booking`)
      .json({ courtNumber: 2 })
      .loginAs(stranger)
    response.assertStatus(403)
  })

  test('no se confirma la reserva de un partido vencido', async ({ client }) => {
    const { organizer, match } = await setup()
    await Match.query()
      .where('id', match.id)
      .update({ starts_at: DateTime.now().minus({ hours: 1 }).toSQL() })
    const response = await client
      .post(`/api/matches/${match.code}/booking`)
      .json({ courtNumber: 2 })
      .loginAs(organizer)
    response.assertStatus(422)
  })

  test('no se confirma la reserva de un partido cerrado', async ({ client }) => {
    const { organizer, match } = await setup()
    await Match.query()
      .where('id', match.id)
      .update({ status: 'closed', closed_at: DateTime.now().toSQL() })
    const response = await client
      .post(`/api/matches/${match.code}/booking`)
      .json({ courtNumber: 2 })
      .loginAs(organizer)
    response.assertStatus(422)
  })

  test('confirmar la reserva con el partido lleno funciona', async ({ client, assert }) => {
    const { organizer, match } = await setup(3)
    const stored = await Match.findOrFail(match.id)
    assert.equal(stored.status, 'full')
    const response = await client
      .post(`/api/matches/${match.code}/booking`)
      .json({ courtNumber: 6 })
      .loginAs(organizer)
    response.assertStatus(200)
    assert.isTrue(response.body().courtBooked)
    assert.equal(response.body().courtNumber, 6)
  })

  test('la aceptación que llena el partido devuelve filled', async ({ assert }) => {
    const { match } = await setup(2)
    const player = await newUser('jugador')
    const request = await requestToJoin(player, match.code)
    const result = await respondToRequest(request.id, 'accept')
    assert.isTrue(result.filled)
  })

  test('una aceptación que deja puestos libres no devuelve filled', async ({ assert }) => {
    const { match } = await setup(1)
    const player = await newUser('jugador')
    const request = await requestToJoin(player, match.code)
    const result = await respondToRequest(request.id, 'accept')
    assert.isFalse(result.filled)
  })

  test('confirmar, cambiar de cancha y quitar la reserva informan el cambio', async ({
    assert,
  }) => {
    const { branch, match } = await setup()
    const booked = await confirmBooking(match.code, 2)
    assert.equal(booked.bookingChange, 'booked')

    const same = await confirmBooking(match.code, 2)
    assert.isNull(same.bookingChange)

    const moved = await confirmBooking(match.code, 3)
    assert.equal(moved.bookingChange, 'court_changed')

    const unbooked = await updateMatch(match.code, {
      branchId: branch.id,
      courtNumber: null,
      startsAt: DateTime.now().plus({ days: 1 }),
      durationMinutes: 90,
      category: 4,
      type: 'mixed',
      maxPlayers: 4,
      guests: [],
    })
    assert.equal(unbooked.bookingChange, 'unbooked')
    assert.isNull(unbooked.match.courtBookedAt)
  })

  test('editar agregando invitados hasta llenar el partido devuelve filled', async ({ assert }) => {
    const { branch, match } = await setup()
    const result = await updateMatch(match.code, {
      branchId: branch.id,
      courtNumber: null,
      startsAt: DateTime.now().plus({ days: 1 }),
      durationMinutes: 90,
      category: 4,
      type: 'mixed',
      maxPlayers: 4,
      guests: [0, 1, 2].map((i) => ({
        name: `Invitado ${i}`,
        category: 4,
        gender: 'male' as const,
      })),
    })
    assert.isTrue(result.filled)
  })
})
