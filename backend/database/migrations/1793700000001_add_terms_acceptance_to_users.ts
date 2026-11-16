import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('terms_accepted_at', { useTz: true }).nullable()
      table.string('terms_version').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('terms_accepted_at')
      table.dropColumn('terms_version')
    })
  }
}
