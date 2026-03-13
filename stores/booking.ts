import { defineStore } from 'pinia'
import type { Service } from '~/types'

export const useBookingStore = defineStore('booking', () => {
  const selectedDate = ref<Date | null>(null)
  const selectedService = ref<Service | null>(null)
  const availableSlots = ref<string[]>([])

  async function fetchSlots(masterId: string, date: Date) {
    const dateStr = date.toISOString().split('T')[0]
    const data = await $fetch<string[]>(`/api/masters/${masterId}/slots`, {
      params: { date: dateStr },
    })
    availableSlots.value = data ?? []
  }

  async function createBooking(payload: {
    masterId: string
    serviceId: string
    startsAt: string
    notes?: string
  }) {
    return await $fetch(`/api/masters/${payload.masterId}/book`, {
      method: 'POST',
      body: {
        service_id: payload.serviceId,
        starts_at: payload.startsAt,
        notes: payload.notes,
      },
    })
  }

  return { selectedDate, selectedService, availableSlots, fetchSlots, createBooking }
})
