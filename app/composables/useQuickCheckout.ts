import { defineStore } from 'pinia'
import type { Booking, PaymentType } from '~/types'

export const useQuickCheckout = defineStore('quickCheckout', () => {
  const isOpen = ref(false)
  const booking = ref<Booking | null>(null)
  const paymentTypes = ref<PaymentType[]>([])
  const loading = ref(false)

  function openCheckout(selectedBooking: Booking) {
    booking.value = selectedBooking
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    booking.value = null
  }

  async function fetchPaymentTypes() {
    const data = await $fetch<PaymentType[]>('/api/master/payment-types')
    paymentTypes.value = data ?? []
  }

  async function submitCheckout(bookingId: string, amount: number, paymentTypeId: string, note?: string) {
    loading.value = true
    try {
      await $fetch(`/api/master/bookings/${bookingId}/checkout`, {
        method: 'POST',
        body: { payment_type_id: paymentTypeId, amount, note: note || null },
      })
      close()
    }
    finally {
      loading.value = false
    }
  }

  return { isOpen, booking, paymentTypes, loading, openCheckout, close, fetchPaymentTypes, submitCheckout }
})
