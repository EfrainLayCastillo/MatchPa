import vine from '@vinejs/vine'

export const branchSuggestionValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(80),
  locationLabel: vine.string().trim().minLength(2).maxLength(80),
  mapsUrl: vine.string().trim().url().maxLength(500).optional(),
})
