import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'availabilities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('users.id').onDelete('CASCADE')
      table.date('date').notNullable()
      table.time('from_time').notNullable()
      table.time('to_time').notNullable()
      table
        .integer('company_id')
        .unsigned()
        .nullable()
        .references('companies.id')
        .onDelete('SET NULL')
      table.unique(['user_id', 'date'])
      table.check('to_time > from_time')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
