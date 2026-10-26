const MIN_DIGITS = 7
const MAX_DIGITS = 15

/** Keeps the digits and an optional leading "+". Returns null when the input isn't a phone number. */
export function normalizeWhatsapp(input: string): string | null {
  const cleaned = input.replace(/[\s()-]/g, '')
  if (!/^\+?\d+$/.test(cleaned)) return null

  const digits = cleaned.replace('+', '')
  if (digits.length < MIN_DIGITS || digits.length > MAX_DIGITS) return null
  return cleaned
}
