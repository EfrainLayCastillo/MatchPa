import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.renameTable('companies', 'branches')
    this.schema.alterTable('matches', (table) => {
      table.renameColumn('company_id', 'branch_id')
    })
    this.schema.alterTable('availabilities', (table) => {
      table.renameColumn('company_id', 'branch_id')
    })
  }

  async down() {
    this.schema.alterTable('availabilities', (table) => {
      table.renameColumn('branch_id', 'company_id')
    })
    this.schema.alterTable('matches', (table) => {
      table.renameColumn('branch_id', 'company_id')
    })
    this.schema.renameTable('branches', 'companies')
  }
}
