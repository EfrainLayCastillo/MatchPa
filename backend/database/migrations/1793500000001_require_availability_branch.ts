import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'availabilities'

  async up() {
    this.schema.raw(`DELETE FROM ${this.tableName} WHERE branch_id IS NULL`)
    this.dropBranchForeignKeys()
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('branch_id').unsigned().notNullable().alter()
    })
    this.schema.alterTable(this.tableName, (table) => {
      table.foreign('branch_id').references('branches.id').onDelete('CASCADE')
    })
  }

  async down() {
    this.dropBranchForeignKeys()
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('branch_id').unsigned().nullable().alter()
    })
    this.schema.alterTable(this.tableName, (table) => {
      table.foreign('branch_id').references('branches.id').onDelete('SET NULL')
    })
  }

  private dropBranchForeignKeys() {
    for (const name of ['availabilities_company_id_foreign', 'availabilities_branch_id_foreign']) {
      this.schema.raw(`ALTER TABLE ${this.tableName} DROP CONSTRAINT IF EXISTS ${name}`)
    }
  }
}
