import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('users', (table) => {
      table.timestamp('email_verified_at', { useTz: true }).nullable()
    })
    this.schema.raw(
      "UPDATE users SET email_verified_at = created_at WHERE google_id IS NOT NULL AND email NOT LIKE '%@google.matchpa'"
    )
    this.schema.createTable('email_verifications', (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .unique()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('code_hash').notNullable()
      table.timestamp('expires_at', { useTz: true }).notNullable()
      table.integer('attempts').notNullable().defaultTo(0)
      table.timestamp('created_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable('email_verifications')
    this.schema.alterTable('users', (table) => {
      table.dropColumn('email_verified_at')
    })
  }
}
