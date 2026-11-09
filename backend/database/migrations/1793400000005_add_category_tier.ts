import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    for (const tableName of ['users', 'matches']) {
      this.schema.alterTable(tableName, (table) => {
        table.string('category_tier').nullable()
      })
      this.schema.raw(
        `ALTER TABLE ${tableName} ADD CONSTRAINT ${tableName}_category_tier_check CHECK (category_tier IN ('high', 'entry'))`
      )
    }
  }

  async down() {
    for (const tableName of ['users', 'matches']) {
      this.schema.alterTable(tableName, (table) => {
        table.dropColumn('category_tier')
      })
    }
  }
}
