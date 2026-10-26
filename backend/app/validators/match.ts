import vine from '@vinejs/vine'

const guest = vine.object({
  name: vine.string().trim().minLength(2).maxLength(80),
  category: vine.number().in([1, 2, 3, 4, 5, 6, 7]),
  gender: vine.enum(['male', 'female'] as const),
})

export const matchValidator = vine.create({
  companyId: vine.number().positive(),
  courtNumber: vine.number().min(1).max(50),
  startsAt: vine.string().trim(),
  durationMinutes: vine.number().in([90, 120]),
  category: vine.number().in([1, 2, 3, 4, 5, 6, 7]),
  type: vine.enum(['male', 'female', 'mixed'] as const),
  maxPlayers: vine.number().in([4, 5, 6]),
  guests: vine.array(guest).maxLength(5).optional(),
})

export const inviteValidator = vine.create({
  userId: vine.number().positive(),
})

export const matchFiltersValidator = vine.create({
  date: vine
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  companyId: vine.number().positive().optional(),
  type: vine.enum(['male', 'female', 'mixed'] as const).optional(),
})

export const playerFiltersValidator = vine.create({
  date: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  companyId: vine.number().positive().optional(),
})

export const requestActionValidator = vine.create({
  action: vine.enum(['accept', 'reject', 'leave', 'remove'] as const),
})

export const pushSubscriptionValidator = vine.create({
  endpoint: vine.string().url(),
  keys: vine.object({
    p256dh: vine.string(),
    auth: vine.string(),
  }),
})
