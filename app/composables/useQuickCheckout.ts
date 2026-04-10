import { defineStore } from 'pinia'
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import type { Booking } from '~/types'
import { analyticsQuery, bookingsQuery, paymentTypesQuery } from '~/composables/queries/dashboard'

type CheckoutPayload = {
  bookingId: string
  amount: number
  paymentTypeId: string
  note?: string
}

export const useQuickCheckout = defineStore('quickCheckout', () => {
  const isOpen = ref(false)
  const booking = ref<Booking | null>(null)
  const queryCache = useQueryCache()

  const { data: paymentTypes, asyncStatus: paymentTypesAsyncStatus } = useQuery({
    ...paymentTypesQuery,
    enabled: () => import.meta.client,
  })

  function openCheckout(selectedBooking: Booking) {
    booking.value = selectedBooking
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    booking.value = null
  }

  const { mutateAsync: submitCheckout, asyncStatus: checkoutAsyncStatus } = useMutation({
    mutation: ({ bookingId, amount, paymentTypeId, note }: CheckoutPayload) =>
      $fetch(`/api/master/bookings/${bookingId}/checkout`, {
        method: 'POST',
        body: { payment_type_id: paymentTypeId, amount, note: note ?? null },
      }),
    onSuccess: () => {
      close()
      queryCache.invalidateQueries({ key: bookingsQuery.key })
      queryCache.invalidateQueries({ key: analyticsQuery.key })
    },
  })

  const loading = computed(() => checkoutAsyncStatus.value === 'loading')

  return {
    isOpen,
    booking,
    paymentTypes,
    paymentTypesAsyncStatus,
    loading,
    openCheckout,
    close,
    submitCheckout,
  }
})
