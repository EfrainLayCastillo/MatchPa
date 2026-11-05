import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export type BranchSuggestionStatus = 'pending' | 'approved' | 'rejected'

export default class BranchSuggestion extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column()
  declare locationLabel: string

  @column()
  declare mapsUrl: string | null

  @column()
  declare status: BranchSuggestionStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
