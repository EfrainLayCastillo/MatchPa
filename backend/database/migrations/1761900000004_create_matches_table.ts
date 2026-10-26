import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'matches'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('code', 8).notNullable().unique()
      table
        .integer('organizer_id')
        .unsigned()
        .notNullable()
        .references('users.id')
        .onDelete('CASCADE')
      table.integer('company_id').unsigned().notNullable().references('companies.id')
      table.integer('court_number').notNullable()
      table.timestamp('starts_at', { useTz: true }).notNullable()
      table.smallint('duration_minutes').notNullable()
      table.integer('category').notNullable()
      table.string('type', 10).notNullable()
      table.smallint('max_players').notNullable().defaultTo(4)
      table.string('status', 10).notNullable().defaultTo('open')
      table.timestamp('closed_at', { useTz: true }).nullable()
      table.check('duration_minutes in (90, 120)')
      table.check('category between 1 and 7')
      table.check("type in ('male', 'female', 'mixed')")
      table.check('max_players between 4 and 6')
      table.check("status in ('open', 'full', 'closed')")
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
