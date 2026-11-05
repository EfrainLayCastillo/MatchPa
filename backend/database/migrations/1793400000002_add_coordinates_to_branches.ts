import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'branches'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('latitude', 9, 6).nullable()
      table.decimal('longitude', 9, 6).nullable()
      table.string('phone').nullable().alter()
      table.string('website').nullable().alter()
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.from(this.tableName).whereNull('phone').update({ phone: '' })
      await db.from(this.tableName).whereNull('website').update({ website: '' })
    })
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('latitude')
      table.dropColumn('longitude')
      table.string('phone').notNullable().alter()
      table.string('website').notNullable().alter()
    })
  }
}
