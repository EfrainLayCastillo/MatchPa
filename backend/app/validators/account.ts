import vine from '@vinejs/vine'

export const deleteAccountValidator = vine.create({
  confirm: vine.literal('ELIMINAR'),
})
