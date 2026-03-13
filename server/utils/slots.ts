/**
 * Generates time slots for a given date based on work hours.
 * @param date - The date to generate slots for (YYYY-MM-DD)
 * @param startHour - Work start hour (0-23)
 * @param endHour - Work end hour (0-23)
 * @param durationMinutes - Duration of each slot in minutes
 * @param bookedSlots - Array of already booked start times (ISO strings)
 * @returns Array of available slot start times (ISO strings)
 */
export function generateSlots(
  date: string,
  startHour: number,
  endHour: number,
  durationMinutes: number,
  bookedSlots: string[],
): string[] {
  const slots: string[] = []
  const bookedSet = new Set(bookedSlots)

  const current = new Date(`${date}T00:00:00.000Z`)
  current.setUTCHours(startHour, 0, 0, 0)

  const end = new Date(`${date}T00:00:00.000Z`)
  end.setUTCHours(endHour, 0, 0, 0)

  while (current < end) {
    const slotTime = current.toISOString()
    const slotEnd = new Date(current.getTime() + durationMinutes * 60_000)

    if (slotEnd <= end && !bookedSet.has(slotTime)) {
      slots.push(slotTime)
    }

    current.setTime(current.getTime() + durationMinutes * 60_000)
  }

  return slots
}
