import vine from '@vinejs/vine'

export const registerValidator = vine.create({
  fullName: vine.string().trim().minLength(2).maxLength(120),
  email: vine.string().trim().email().normalizeEmail(),
  password: vine.string().minLength(8).maxLength(72),
})

export const loginValidator = vine.create({
  email: vine.string().trim().email().normalizeEmail(),
  password: vine.string(),
})
