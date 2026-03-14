const STEP_MINUTES = 30

export interface TimeSlot {
  start: string
  end: string
  available: boolean
}

interface WorkDayHours {
  start: number
  end: number
}

interface Booking {
  starts_at: string
  ends_at: string
}

/**
 * Generates time slots for a given date based on work hours and existing bookings.
 * @param workHours - Master's work_hours JSON keyed by weekday (e.g. { monday: { start: 9, end: 18 } })
 * @param existingBookings - Active bookings for the date (status != cancelled)
 * @param date - The date to generate slots for (YYYY-MM-DD)
 * @param serviceDuration - Duration of the service in minutes
 * @param bufferMinutes - Buffer time between bookings in minutes (default: 10)
 * @returns Array of time slots with availability flag
 */
export function generateSlots(
  workHours: Record<string, WorkDayHours | null>,
  existingBookings: Booking[],
  date: string,
  serviceDuration: number,
  bufferMinutes = 10,
): TimeSlot[] {
  const dayOfWeek = new Date(`${date}T12:00:00Z`)
    .toLocaleDateString('en-US', {
      weekday: 'long',
      timeZone: 'UTC',
    })
    .toLowerCase()

  const dayHours = workHours?.[dayOfWeek]
  if (!dayHours) return []

  const workStart = new Date(`${date}T00:00:00.000Z`)
  workStart.setUTCHours(dayHours.start, 0, 0, 0)

  const workEnd = new Date(`${date}T00:00:00.000Z`)
  workEnd.setUTCHours(dayHours.end, 0, 0, 0)

  const slots: TimeSlot[] = []
  const current = new Date(workStart)

  while (current < workEnd) {
    const slotStart = new Date(current)
    const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60_000)

    if (slotEnd > workEnd) break

    const available = !existingBookings.some((booking) => {
      const bookingStart = new Date(booking.starts_at)
      const bookingEnd = new Date(new Date(booking.ends_at).getTime() + bufferMinutes * 60_000)
      return slotStart < bookingEnd && slotEnd > bookingStart
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
