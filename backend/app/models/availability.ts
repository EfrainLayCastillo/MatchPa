import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Branch from '#models/branch'
import User from '#models/user'

export default class Availability extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column.date({ serialize: (value: DateTime) => value.toISODate() })
  declare date: DateTime

  @column()
  declare fromTime: string

  @column()
  declare toTime: string

  @column()
  declare branchId: number | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Branch)
  declare branch: BelongsTo<typeof Branch>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
