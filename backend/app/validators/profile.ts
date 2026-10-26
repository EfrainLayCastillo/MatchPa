import vine from '@vinejs/vine'

export const updateProfileValidator = vine.create({
  fullName: vine.string().trim().minLength(2).maxLength(120).optional(),
  category: vine.number().in([1, 2, 3, 4, 5, 6, 7]).optional(),
  gender: vine.enum(['male', 'female'] as const).optional(),
  phone: vine
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]+$/)
    .maxLength(25)
    .optional(),
})

export const availabilityValidator = vine.create({
  fromTime: vine.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  toTime: vine.string().regex(/^(([01]\d|2[0-3]):[0-5]\d|24:00)$/),
  companyId: vine.number().positive().nullable(),
})
