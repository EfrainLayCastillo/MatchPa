import Branch from '#models/branch'
import { serializeBranch } from '#serializers/match_serializer'

export default class BranchesController {
  async index() {
    const branches = await Branch.query().orderBy('name')
    return branches.map(serializeBranch)
  }
}
