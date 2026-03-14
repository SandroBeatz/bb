import type { Booking, Service } from '~/types'

export const useBooking = () => {
  const booking = ref<Booking | null>(null)
  const availableSlots = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAvailableSlots(masterId: string, date: Date) {
    loading.value = true
    error.value = null
    try {
      const dateStr = date.toISOString().split('T')[0]
      const data = await $fetch<string[]>(`/api/masters/${masterId}/slots`, {
        params: { date: dateStr },
      })
      availableSlots.value = data ?? []
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch slots'
    } finally {
      loading.value = false
    }
  }

  async function book(masterId: string, service: Service, startsAt: string, notes?: string) {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<Booking>(`/api/masters/${masterId}/book`, {
        method: 'POST',
        body: { service_id: service.id, starts_at: startsAt, notes },
      })
      booking.value = data
      return data
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to create booking'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { booking, availableSlots, loading, error, fetchAvailableSlots, book }
}
