import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Company from '#models/company'

export default class CompanySeeder extends BaseSeeder {
  async run() {
    await Company.updateOrCreateMany('slug', [
      {
        name: 'WePadel',
        slug: 'wepadel',
        phone: '+507 200-0001',
        locationLabel: 'Centennial',
        mapsUrl: 'https://maps.google.com/?q=WePadel+Centennial',
        website: 'https://wepadel.com',
      },
      {
        name: 'XForce',
        slug: 'xforce',
        phone: '+507 200-0002',
        locationLabel: 'Costa del Este',
        mapsUrl: 'https://maps.google.com/?q=XForce+Costa+del+Este',
        website: 'https://xforce.com',
      },
    ])
  }
}
