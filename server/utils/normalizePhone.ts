/** Normalize phone to E.164-like format: strip non-digits except leading +, ensure + prefix */
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '')
  if (!cleaned) return ''
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`
}
