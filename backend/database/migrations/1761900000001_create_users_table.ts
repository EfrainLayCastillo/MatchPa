import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('full_name').notNullable()
      table.string('email').notNullable().unique()
      table.string('password').nullable()
      table.string('google_id').nullable().unique()
      table.string('avatar_url').nullable()
      table.string('phone').nullable()
      table.integer('category').nullable()
      table.string('gender', 10).nullable()
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
