import { DateTime } from 'luxon'
import { compose } from '@adonisjs/core/helpers'
import encryption from '@adonisjs/core/services/encryption'
import hash from '@adonisjs/core/services/hash'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Availability from '#models/availability'
import MatchRequest from '#models/match_request'
import PushSubscription from '#models/push_subscription'

export default class User extends compose(BaseModel, withAuthFinder(hash)) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string | null

  @column({ serializeAs: null })
  declare googleId: string | null

  @column()
  declare avatarUrl: string | null

  /** Encrypted at rest with APP_KEY. Only the owner, and the organizer's accepted players, can read it. */
  @column({
    columnName: 'whatsapp_encrypted',
    serializeAs: null,
    prepare: (value: string | null) => (value ? encryption.encrypt(value) : null),
    consume: (value: string | null) => (value ? encryption.decrypt<string>(value) : null),
  })
  declare whatsapp: string | null

  @column()
  declare category: number | null

  @column()
  declare gender: 'male' | 'female' | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Availability)
  declare availabilities: HasMany<typeof Availability>

  @hasMany(() => MatchRequest)
  declare matchRequests: HasMany<typeof MatchRequest>

  @hasMany(() => PushSubscription)
  declare pushSubscriptions: HasMany<typeof PushSubscription>
}
