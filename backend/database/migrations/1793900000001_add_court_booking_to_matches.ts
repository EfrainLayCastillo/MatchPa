import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('matches', (table) => {
      table.timestamp('court_booked_at', { useTz: true }).nullable()
      table.integer('court_number').nullable().alter()
    })
    this.schema.raw('UPDATE matches SET court_booked_at = created_at')
    this.schema.raw(
      'ALTER TABLE matches ADD CONSTRAINT matches_court_booking_check CHECK ((court_booked_at IS NULL) = (court_number IS NULL))'
    )
  }

  /** Fails if any match still has no court: assign one before rolling back. */
  async down() {
    this.schema.raw('ALTER TABLE matches DROP CONSTRAINT matches_court_booking_check')
    this.schema.alterTable('matches', (table) => {
      table.dropColumn('court_booked_at')
      table.integer('court_number').notNullable().alter()
    })
  }
}
