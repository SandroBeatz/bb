import { defineStore } from 'pinia'
import type { Service, TimeSlot } from '~/types'

export const useBookingStore = defineStore('booking', () => {
  const currentStep = ref<number>(1)
  const selectedDate = ref<Date | null>(null)
  const selectedService = ref<Service | null>(null)
  const selectedSlot = ref<string | null>(null)
  const availableSlots = ref<TimeSlot[]>([])

  async function fetchSlots(masterId: string, date: Date, serviceId?: string) {
    const dateStr = date.toISOString().split('T')[0]
    const params: Record<string, string> = { date: dateStr }
    if (serviceId) params.service_id = serviceId
    const data = await $fetch<TimeSlot[]>(`/api/masters/${masterId}/slots`, { params })
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

  function nextStep() {
    if (currentStep.value < 4) currentStep.value++
  }

  function prevStep() {
    if (currentStep.value > 1) currentStep.value--
  }

  function resetBooking() {
    currentStep.value = 1
    selectedDate.value = null
    selectedService.value = null
    selectedSlot.value = null
    availableSlots.value = []
  }

  return {
    currentStep,
    selectedDate,
    selectedService,
    selectedSlot,
    availableSlots,
    fetchSlots,
    createBooking,
    nextStep,
    prevStep,
    resetBooking,
  }
})
