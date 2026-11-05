import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      await db.from('branches').where('slug', 'xforce').update({ slug: 'padel-x-force-club' })
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.from('branches').where('slug', 'padel-x-force-club').update({ slug: 'xforce' })
    })
  }
}
