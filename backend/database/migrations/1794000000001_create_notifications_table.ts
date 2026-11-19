import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('users.id').onDelete('CASCADE')
      table
        .integer('match_id')
        .unsigned()
        .notNullable()
        .references('matches.id')
        .onDelete('CASCADE')
      table.string('type').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.index(['user_id', 'created_at'])
      table.index(['match_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
