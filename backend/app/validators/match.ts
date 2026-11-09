import vine from '@vinejs/vine'

const guest = vine.object({
  name: vine.string().trim().minLength(2).maxLength(80),
  category: vine.number().in([1, 2, 3, 4, 5, 6, 7]),
  gender: vine.enum(['male', 'female'] as const),
})

export const matchValidator = vine.create({
  branchId: vine.number().positive(),
  courtNumber: vine.number().min(1).max(50),
  startsAt: vine.string().trim(),
  durationMinutes: vine.number().in([60, 90, 120]),
  category: vine.number().in([1, 2, 3, 4, 5, 6, 7]),
  categoryTier: vine
    .enum(['high', 'entry'] as const)
    .nullable()
    .optional(),
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
  branchId: vine.number().positive().optional(),
  type: vine.enum(['male', 'female', 'mixed'] as const).optional(),
})

export const playerFiltersValidator = vine.create({
  date: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  branchId: vine.number().positive().optional(),
})

export const requestActionValidator = vine.create({
  action: vine.enum(['accept', 'reject', 'leave', 'remove'] as const),
})

/** Only browser push services: the server POSTs to this URL, so any other host is an SSRF target. */
const PUSH_SERVICE_URL =
  /^https:\/\/(fcm\.googleapis\.com|([a-z0-9-]+\.)*push\.services\.mozilla\.com|web\.push\.apple\.com|[a-z0-9-]+\.notify\.windows\.com)\//

export const pushSubscriptionValidator = vine.create({
  endpoint: vine.string().url().regex(PUSH_SERVICE_URL),
  keys: vine.object({
    p256dh: vine.string(),
    auth: vine.string(),
  }),
})
