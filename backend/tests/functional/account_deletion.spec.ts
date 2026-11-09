import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import Branch from '#models/branch'
import Match from '#models/match'
import MatchRequest from '#models/match_request'
import User from '#models/user'
import { deleteAccount } from '#services/account_deletion'
import { publishMatch, requestToJoin, respondToRequest } from '#services/match_service'

test.group('eliminar cuenta', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  const suffix = () => `${Date.now()}${Math.random().toString(36).slice(2, 6)}`

  async function newUser(label: string) {
    const user = await User.create({
      fullName: label,
      email: `${label}-${suffix()}@t.test`,
      password: 'secret123',
      category: 4,
      categoryTier: 'high',
      gender: 'male',
      whatsapp: '+50760000000',
      emailVerifiedAt: DateTime.now(),
    })
    return user.refresh()
  }

  async function newBranch() {
    return Branch.create({
      name: 'WePadel',
      slug: `wepadel-${suffix()}`,
      phone: '+507 200-0001',
      locationLabel: 'Centennial',
      mapsUrl: 'https://maps.google.com',
      website: 'https://wepadel.com',
    })
  }

  async function publish(organizer: User, branch: Branch, days: number, court = 1) {
    return publishMatch(organizer, {
      branchId: branch.id,
      courtNumber: court,
      startsAt: DateTime.now().plus({ days }),
      durationMinutes: 90,
      category: 4,
      type: 'mixed',
      maxPlayers: 4,
      guests: [
        { name: 'G1', category: 4, gender: 'male' },
        { name: 'G2', category: 4, gender: 'male' },
      ],
    })
  }

  async function statusOf(code: string) {
    const match = await Match.findByOrFail('code', code)
    return match.status
  }

  async function requestStatus(id: number) {
    const request = await MatchRequest.findOrFail(id)
    return request.status
  }

  test('borra los datos personales y sube session_version', async ({ assert }) => {
    const user = await newUser('borrar')
    const before = user.sessionVersion

    await deleteAccount(user)

    await user.refresh()
    assert.equal(user.fullName, 'Jugador eliminado')
    assert.equal(user.email, `deleted-${user.id}@matchpa.invalid`)
    assert.isNull(user.password)
    assert.isNull(user.whatsapp)
    assert.isNull(user.category)
    assert.isNull(user.categoryTier)
    assert.isNull(user.gender)
    assert.isNull(user.emailVerifiedAt)
    assert.isNotNull(user.deletedAt)
    assert.equal(user.sessionVersion, before + 1)
  })

  test('cierra el partido futuro que organiza y cancela sus pendientes', async ({ assert }) => {
    const branch = await newBranch()
    const organizer = await newUser('org')
    const player = await newUser('pl')
    const match = await publish(organizer, branch, 2)
    const request = await requestToJoin(player, match.code)

    const result = await deleteAccount(organizer)

    assert.deepEqual(
      result.closed.map(({ match: closed }) => closed.code),
      [match.code]
    )
    assert.equal(await statusOf(match.code), 'closed')
    assert.equal(await requestStatus(request.id), 'cancelled')
    assert.deepEqual(result.closed[0].playerIds, [])
    assert.deepEqual(result.closed[0].requesterIds, [player.id])
  })

  test('libera su puesto en un partido futuro ajeno y lo reabre', async ({ assert }) => {
    const branch = await newBranch()
    const organizer = await newUser('org')
    const player = await newUser('pl')
    const match = await publish(organizer, branch, 2)
    const request = await requestToJoin(player, match.code)
    await respondToRequest(request.id, 'accept')
    assert.equal(await statusOf(match.code), 'full')

    const result = await deleteAccount(player)

    assert.deepEqual(
      result.freed.map((freed) => freed.code),
      [match.code]
    )
    assert.equal(await requestStatus(request.id), 'left')
    assert.equal(await statusOf(match.code), 'open')
  })

  test('cancela sus solicitudes pendientes en partidos ajenos', async ({ assert }) => {
    const branch = await newBranch()
    const organizer = await newUser('org')
    const player = await newUser('pl')
    const match = await publish(organizer, branch, 2)
    const request = await requestToJoin(player, match.code)

    await deleteAccount(player)

    assert.equal(await requestStatus(request.id), 'cancelled')
    assert.equal(await statusOf(match.code), 'open')
  })

  test('un partido pasado queda intacto', async ({ assert }) => {
    const branch = await newBranch()
    const organizer = await newUser('org')
    const match = await publish(organizer, branch, 2)
    await Match.query()
      .where('id', match.id)
      .update({ starts_at: DateTime.now().minus({ days: 1 }).toSQL()! })

    const result = await deleteAccount(organizer)

    assert.lengthOf(result.closed, 0)
    const stored = await Match.findOrFail(match.id)
    assert.equal(stored.status, 'open')
    assert.isNull(stored.closedAt)
  })

  test('el mismo correo puede registrarse de nuevo', async ({ assert }) => {
    const user = await newUser('again')
    const email = user.email

    await deleteAccount(user)

    const fresh = await User.create({ fullName: 'Nuevo', email, password: 'secret123' })
    assert.notEqual(fresh.id, user.id)
  })

  test('DELETE /api/me exige escribir ELIMINAR', async ({ client }) => {
    const user = await newUser('confirma')
    const response = await client.delete('/api/me').json({ confirm: 'borrar' }).loginAs(user)
    response.assertStatus(422)
  })

  test('DELETE /api/me elimina la cuenta y cierra la sesión', async ({ client, assert }) => {
    const user = await newUser('borra')
    const response = await client.delete('/api/me').json({ confirm: 'ELIMINAR' }).loginAs(user)
    response.assertStatus(204)

    await user.refresh()
    assert.isNotNull(user.deletedAt)
    const after = await client.get('/api/me').withSession({ session_version: 0 }).loginAs(user)
    after.assertStatus(401)
  })
})
