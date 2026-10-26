import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

/** Dummy accounts for local development. Password for both: secret123 */
export default class UserSeeder extends BaseSeeder {
  async run() {
    await User.updateOrCreateMany('email', [
      {
        fullName: 'Ana Dummy',
        email: 'ana@matchpa.test',
        password: 'secret123',
        category: 4,
        gender: 'female',
        whatsapp: '+507 6000-0101',
      },
      {
        fullName: 'Beto Dummy',
        email: 'beto@matchpa.test',
        password: 'secret123',
        category: 3,
        gender: 'male',
        whatsapp: '+507 6000-0102',
      },
    ])
  }
}
