import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'branch_suggestions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('users.id').onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('location_label').notNullable()
      table.string('maps_url', 500).nullable()
      table.string('status').notNullable().defaultTo('pending')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
    this.schema.raw(
      `ALTER TABLE branch_suggestions ADD CONSTRAINT branch_suggestions_status_check CHECK (status IN ('pending','approved','rejected'))`
    )
    this.schema.raw(
      `CREATE UNIQUE INDEX branch_suggestions_one_pending_per_user ON branch_suggestions (user_id) WHERE status = 'pending'`
    )
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
