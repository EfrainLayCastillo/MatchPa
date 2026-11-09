import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw('ALTER TABLE matches DROP CONSTRAINT matches_duration_minutes_check')
    this.schema.raw(
      'ALTER TABLE matches ADD CONSTRAINT matches_duration_minutes_check CHECK (duration_minutes IN (60, 90, 120))'
    )
  }

  async down() {
    this.schema.raw('ALTER TABLE matches DROP CONSTRAINT matches_duration_minutes_check')
    this.schema.raw(
      'ALTER TABLE matches ADD CONSTRAINT matches_duration_minutes_check CHECK (duration_minutes IN (90, 120))'
    )
  }
}
