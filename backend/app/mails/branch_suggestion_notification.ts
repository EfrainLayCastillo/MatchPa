import { BaseMail } from '@adonisjs/mail'
import type BranchSuggestion from '#models/branch_suggestion'
import type User from '#models/user'

export default class BranchSuggestionNotification extends BaseMail {
  constructor(
    private suggestion: BranchSuggestion,
    private user: Pick<User, 'fullName' | 'email'>,
    private adminEmail: string
  ) {
    super()
  }

  prepare() {
    const { suggestion, user } = this
    const lines = [
      'Nueva sugerencia de sucursal en MatchPa.',
      '',
      `Nombre: ${suggestion.name}`,
      `Zona: ${suggestion.locationLabel}`,
      `Enlace: ${suggestion.mapsUrl ?? 'sin enlace'}`,
      `Sugerida por: ${user.fullName} <${user.email}>`,
    ]
    this.message
      .to(this.adminEmail)
      .subject(`Sugerencia de sucursal: ${suggestion.name}`)
      .replyTo(user.email)
      .text(lines.join('\n'))
  }
}
