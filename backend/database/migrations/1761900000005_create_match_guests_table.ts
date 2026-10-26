import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'match_guests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('match_id')
        .unsigned()
        .notNullable()
        .references('matches.id')
        .onDelete('CASCADE')
      table.string('name').notNullable()
      table.integer('category').notNullable()
      table.string('gender', 10).notNullable()
      table.check('category between 1 and 7')
      table.check("gender in ('male', 'female')")
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
