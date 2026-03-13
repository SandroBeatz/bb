import type { Booking, PaymentType } from '~/types'

export const useQuickCheckout = () => {
  const isOpen = ref(false)
  const booking = ref<Booking | null>(null)
  const paymentTypes = ref<PaymentType[]>([])
  const loading = ref(false)

  function open(selectedBooking: Booking) {
    booking.value = selectedBooking
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    booking.value = null
  }

  async function fetchPaymentTypes(masterId: string) {
    const data = await $fetch<PaymentType[]>('/api/master/payment-types', {
      params: { master_id: masterId },
    })
    paymentTypes.value = data ?? []
  }

  async function checkout(bookingId: string, paymentTypeId: string, amount: number) {
    loading.value = true
    try {
      await $fetch(`/api/master/bookings/${bookingId}/checkout`, {
        method: 'POST',
        body: { payment_type_id: paymentTypeId, amount },
      })
      close()
    }
    finally {
      loading.value = false
    }
  }

  return { isOpen, booking, paymentTypes, loading, open, close, fetchPaymentTypes, checkout }
}
