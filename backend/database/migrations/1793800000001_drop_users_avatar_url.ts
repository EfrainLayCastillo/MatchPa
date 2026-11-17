import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('users', (table) => {
      table.dropColumn('avatar_url')
    })
  }

  async down() {
    this.schema.alterTable('users', (table) => {
      table.string('avatar_url').nullable()
    })
  }
}
