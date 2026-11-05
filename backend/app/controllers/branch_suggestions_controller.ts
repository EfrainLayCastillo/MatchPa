import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import BusinessRuleError from '#exceptions/business_rule_error'
import BranchSuggestion from '#models/branch_suggestion'
import BranchSuggestionNotification from '#mails/branch_suggestion_notification'
import env from '#start/env'
import { isUniqueViolation } from '#exceptions/unique_violation'
import { assertEmailVerified } from '#services/email_verification'
import { branchSuggestionValidator } from '#validators/branch_suggestion'

export default class BranchSuggestionsController {
  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    assertEmailVerified(user)
    const data = await request.validateUsing(branchSuggestionValidator)

    const suggestion = await BranchSuggestion.create({
      userId: user.id,
      name: data.name,
      locationLabel: data.locationLabel,
      mapsUrl: data.mapsUrl ?? null,
    }).catch((error) => {
      if (isUniqueViolation(error)) {
        throw new BusinessRuleError('Ya tienes una sugerencia en revisión', { status: 409 })
      }
      throw error
    })
    await suggestion.refresh()

    const adminEmail = env.get('ADMIN_EMAIL')
    if (adminEmail) {
      await mail.sendLater(new BranchSuggestionNotification(suggestion, user, adminEmail))
    }

    return response.created({
      id: suggestion.id,
      name: suggestion.name,
      locationLabel: suggestion.locationLabel,
      mapsUrl: suggestion.mapsUrl,
      status: suggestion.status,
    })
  }
}
