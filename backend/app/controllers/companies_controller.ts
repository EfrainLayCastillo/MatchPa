import Company from '#models/company'
import { serializeCompany } from '#serializers/match_serializer'

export default class CompaniesController {
  async index() {
    const companies = await Company.query().orderBy('name')
    return companies.map(serializeCompany)
  }
}
