const STEP_MINUTES = 30

export interface TimeSlot {
  start: string
  end: string
  available: boolean
}

// DB stores short day keys: "mon", "tue", "wed", "thu", "fri", "sat", "sun"
// new Date().toLocaleDateString gives full names: "Monday", "Tuesday" etc.
const FULL_TO_SHORT: Record<string, string> = {
  sunday: 'sun',
  monday: 'mon',
  tuesday: 'tue',
  wednesday: 'wed',
  thursday: 'thu',
  friday: 'fri',
  saturday: 'sat',
}

interface WorkDayRaw {
  start: string | number // "09:00" or 9
  end: string | number // "18:00" or 18
  off?: boolean // onboarding format
}

interface Booking {
  starts_at: string
  ends_at: string
}

/** Parse "09:00" or 9 → total minutes from midnight */
function toMinutes(val: string | number): number {
  if (typeof val === 'number') return val * 60
  const [h = 0, m = 0] = val.split(':').map(Number)
  return h * 60 + m
}

/**
 * Generates time slots for a given date.
 *
 * work_hours format (DB): { mon: { start: "09:00", end: "18:00" } | null, ... }
 * Legacy onboarding format: { mon: { start: "09:00", end: "18:00", off: true }, ... }
 * Also handles old numeric format: { monday: { start: 9, end: 18 } }
 */
export function generateSlots(
  workHours: Record<string, WorkDayRaw | null>,
  existingBookings: Booking[],
  date: string, // YYYY-MM-DD
  serviceDuration: number,
  bufferMinutes = 0,
): TimeSlot[] {
  if (!workHours || !date) return []

  // Get the day name in full lowercase ("monday") then map to short ("mon")
  const fullDay = new Date(`${date}T12:00:00Z`)
    .toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
    .toLowerCase()

  const shortDay = FULL_TO_SHORT[fullDay] ?? fullDay

  // Try short key first (current format), fall back to full key (legacy)
  const raw = workHours[shortDay] ?? workHours[fullDay] ?? null

  // Day is off: either null (settings format) or { off: true } (onboarding format)
  if (!raw || raw.off === true) return []

  const startMin = toMinutes(raw.start)
  const endMin = toMinutes(raw.end)

  if (endMin <= startMin) return []

  const dateBase = new Date(`${date}T00:00:00.000Z`)

  const workStart = new Date(dateBase.getTime() + startMin * 60_000)
  const workEnd = new Date(dateBase.getTime() + endMin * 60_000)

  const slots: TimeSlot[] = []
  const current = new Date(workStart)

  while (current < workEnd) {
    const slotStart = new Date(current)
    const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60_000)

    if (slotEnd > workEnd) break

    const available = !existingBookings.some((booking) => {
      const bStart = new Date(booking.starts_at)
      const bEnd = new Date(new Date(booking.ends_at).getTime() + bufferMinutes * 60_000)
      return slotStart < bEnd && slotEnd > bStart
    })

    slots.push({
      start: slotStart.toISOString(),
      end: slotEnd.toISOString(),
      available,
    })

    current.setTime(current.getTime() + STEP_MINUTES * 60_000)
  }

  return slots
}
