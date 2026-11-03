import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('email_verifications', (table) => {
      table.string('purpose').notNullable().defaultTo('verify_email')
      table.dropUnique(['user_id'])
      table.unique(['user_id', 'purpose'])
    })
    this.schema.raw(
      "ALTER TABLE email_verifications ADD CONSTRAINT email_verifications_purpose_check CHECK (purpose IN ('verify_email','reset_password'))"
    )
    this.schema.alterTable('users', (table) => {
      table.integer('session_version').notNullable().defaultTo(0)
    })
  }

  async down() {
    this.schema.alterTable('users', (table) => {
      table.dropColumn('session_version')
    })
    this.schema.raw("DELETE FROM email_verifications WHERE purpose <> 'verify_email'")
    this.schema.raw(
      'ALTER TABLE email_verifications DROP CONSTRAINT email_verifications_purpose_check'
    )
    this.schema.alterTable('email_verifications', (table) => {
      table.dropUnique(['user_id', 'purpose'])
      table.unique(['user_id'])
      table.dropColumn('purpose')
    })
  }
}
