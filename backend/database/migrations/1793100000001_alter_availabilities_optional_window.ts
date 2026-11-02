import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'availabilities'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.time('from_time').nullable().alter()
      table.time('to_time').nullable().alter()
    })
    this.schema.raw(
      `ALTER TABLE ${this.tableName} ADD CONSTRAINT availabilities_window_pair CHECK ((from_time IS NULL) = (to_time IS NULL))`
    )
  }

  async down() {
    this.schema.raw(
      `UPDATE ${this.tableName} SET from_time = '00:00', to_time = '24:00' WHERE from_time IS NULL`
    )
    this.schema.raw(`ALTER TABLE ${this.tableName} DROP CONSTRAINT availabilities_window_pair`)
    this.schema.alterTable(this.tableName, (table) => {
      table.time('from_time').notNullable().alter()
      table.time('to_time').notNullable().alter()
    })
  }
}
