import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Match from '#models/match'

export const NOTIFICATION_TYPES = [
  'join_requested',
  'invited',
  'request_accepted',
  'invitation_accepted',
  'request_rejected',
  'invitation_rejected',
  'player_left',
  'player_removed',
  'match_filled',
  'court_booked',
  'court_changed',
  'court_unbooked',
  'match_closed',
  'match_cancelled',
  'player_deleted',
] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare matchId: number

  @column()
  declare type: NotificationType

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Match)
  declare match: BelongsTo<typeof Match>
}
