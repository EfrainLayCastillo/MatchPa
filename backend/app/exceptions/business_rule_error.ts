import { Exception } from '@adonisjs/core/exceptions'

export default class BusinessRuleError extends Exception {
  static status = 422
  static code = 'E_BUSINESS_RULE'
}
