import { BaseSchema } from '@adonisjs/lucid/schema'

/** The WhatsApp number is stored encrypted (APP_KEY), so the column needs room for the ciphertext. */
export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('phone', 'whatsapp_encrypted')
    })
    this.schema.alterTable(this.tableName, (table) => {
      table.text('whatsapp_encrypted').nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('whatsapp_encrypted', 255).nullable().alter()
    })
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('whatsapp_encrypted', 'phone')
    })
  }
}
