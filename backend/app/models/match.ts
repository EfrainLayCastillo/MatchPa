import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Company from '#models/company'
import MatchGuest from '#models/match_guest'
import MatchRequest from '#models/match_request'
import User from '#models/user'

export type MatchStatus = 'open' | 'full' | 'closed'
export type MatchType = 'male' | 'female' | 'mixed'

export default class Match extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare code: string

  @column()
  declare organizerId: number

  @column()
  declare companyId: number

  @column()
  declare courtNumber: number

  @column.dateTime()
  declare startsAt: DateTime

  @column()
  declare durationMinutes: 90 | 120

  @column()
  declare category: number

  @column()
  declare type: MatchType

  @column()
  declare maxPlayers: number

  @column()
  declare status: MatchStatus

  @column.dateTime()
  declare closedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'organizerId' })
  declare organizer: BelongsTo<typeof User>

  @belongsTo(() => Company)
  declare company: BelongsTo<typeof Company>

  @hasMany(() => MatchGuest)
  declare guests: HasMany<typeof MatchGuest>

  @hasMany(() => MatchRequest)
  declare requests: HasMany<typeof MatchRequest>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
