import vine from '@vinejs/vine'

export const registerValidator = vine.create({
  fullName: vine.string().trim().minLength(2).maxLength(120),
  email: vine.string().trim().email().normalizeEmail().unique({ table: 'users', column: 'email' }),
  password: vine.string().minLength(8).maxLength(72),
})

export const verifyEmailValidator = vine.create({
  code: vine
    .string()
    .fixedLength(6)
    .regex(/^\d{6}$/),
})

export const loginValidator = vine.create({
  email: vine.string().trim().email().normalizeEmail(),
  password: vine.string(),
})

export const forgotPasswordValidator = vine.create({
  email: vine.string().trim().email().normalizeEmail(),
})

export const resetPasswordValidator = vine.create({
  email: vine.string().trim().email().normalizeEmail(),
  code: vine
    .string()
    .fixedLength(6)
    .regex(/^\d{6}$/),
  password: vine.string().minLength(8).maxLength(72),
})
