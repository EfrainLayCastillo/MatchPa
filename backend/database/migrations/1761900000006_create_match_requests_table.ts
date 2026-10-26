import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'match_requests'

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
      table.string('kind', 20).notNullable()
      table.string('status', 12).notNullable().defaultTo('pending')
      table.check("kind in ('join_request', 'invitation')")
      table.check("status in ('pending', 'accepted', 'rejected', 'cancelled', 'left', 'removed')")
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
    this.schema.raw(
      `create unique index match_requests_one_active_per_user on ${this.tableName} (match_id, user_id) where status in ('pending', 'accepted')`
    )
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
