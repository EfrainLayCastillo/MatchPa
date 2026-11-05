import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

const toNumberOrNull = (value: string | number | null) => (value === null ? null : Number(value))

export default class Branch extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare phone: string | null

  @column()
  declare locationLabel: string

  @column()
  declare mapsUrl: string

  @column()
  declare website: string | null

  @column({ consume: toNumberOrNull })
  declare latitude: number | null

  @column({ consume: toNumberOrNull })
  declare longitude: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
