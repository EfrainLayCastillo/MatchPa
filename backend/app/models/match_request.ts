import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Match from '#models/match'
import User from '#models/user'

export type RequestKind = 'join_request' | 'invitation'
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'left' | 'removed'

export default class MatchRequest extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare matchId: number

  @column()
  declare userId: number

  @column()
  declare kind: RequestKind

  @column()
  declare status: RequestStatus

  @belongsTo(() => Match)
  declare match: BelongsTo<typeof Match>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
