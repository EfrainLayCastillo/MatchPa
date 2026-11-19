import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Match from '#models/match'
import User from '#models/user'

export const SIGNAL_KINDS = ['on_the_way', 'arrived', 'running_late'] as const

export type SignalKind = (typeof SIGNAL_KINDS)[number]

export default class MatchSignal extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare matchId: number

  @column()
  declare userId: number

  @column()
  declare kind: SignalKind

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Match)
  declare match: BelongsTo<typeof Match>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
