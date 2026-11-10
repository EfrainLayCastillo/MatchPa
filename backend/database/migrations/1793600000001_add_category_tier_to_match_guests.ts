import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'match_guests'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('category_tier').nullable()
    })
    this.schema.raw(
      `ALTER TABLE ${this.tableName} ADD CONSTRAINT ${this.tableName}_category_tier_check CHECK (category_tier IN ('high', 'entry'))`
    )
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('category_tier')
    })
  }
}
