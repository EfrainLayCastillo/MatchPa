import vine from '@vinejs/vine'
import { SIGNAL_KINDS } from '#models/match_signal'

export const signalValidator = vine.create({
  kind: vine.enum(SIGNAL_KINDS),
})
