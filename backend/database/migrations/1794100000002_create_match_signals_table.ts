import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'match_signals'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('match_id')
        .unsigned()
        .notNullable()
        .references('matches.id')
        .onDelete('CASCADE')
      table.integer('user_id').unsigned().notNullable().references('users.id').onDelete('CASCADE')
      table.string('kind').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.unique(['match_id', 'user_id', 'kind'])
    })
    this.schema.raw(
      `ALTER TABLE ${this.tableName} ADD CONSTRAINT match_signals_kind_check CHECK (kind IN ('on_the_way', 'arrived', 'running_late'))`
    )
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
