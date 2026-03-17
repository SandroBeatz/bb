<template>
  <UCard class="rounded-xl p-3">
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <UBadge :color="statusColor" variant="soft" size="sm">
            {{ $t(`bookings.status.${booking.status}`) }}
          </UBadge>
          <span class="text-xs text-muted">{{ formattedTime }}</span>
        </div>
        <p class="font-semibold text-base truncate">
          {{ serviceName }}
        </p>
        <p class="text-sm text-muted truncate">
          {{ clientName }}
        </p>
        <p v-if="servicePrice" class="text-sm font-medium mt-1">
          {{ servicePrice }} {{ $t('services.currency') }}
        </p>
      </div>

      <div class="flex flex-col gap-2 shrink-0">
        <UButton
          v-if="booking.status === 'pending'"
          color="success"
          variant="soft"
          size="sm"
          icon="i-heroicons-check"
          :loading="confirming"
          @click="confirm"
        >
          {{ $t('common.confirm') }}
        </UButton>

        <UButton
          v-if="isCompletable"
          color="success"
          variant="soft"
          size="sm"
          icon="i-heroicons-check-circle"
          @click="onComplete"
        >
          {{ $t('checkout.completeSession') }}
        </UButton>

        <UButton
          v-if="isCancellable"
          color="error"
          variant="ghost"
          size="sm"
          icon="i-heroicons-x-mark"
          :loading="cancelling"
          @click="cancel"
        >
          {{ $t('common.cancel') }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useMutation, useQueryCache } from '@pinia/colada'
import type { Booking } from '~/types'
import { analyticsQuery, bookingsQuery } from '~/composables/queries/dashboard'

type BookingWithDetails = Booking & {
  services?: { name: string; price: number; duration_minutes: number } | null
  clients?: { name: string; phone: string } | null
}

const props = defineProps<{
  booking: BookingWithDetails
}>()

const { openCheckout } = useQuickCheckout()
const toast = useToast()
const { t } = useI18n()
const queryCache = useQueryCache()

const { mutate: confirm, asyncStatus: confirmStatus } = useMutation({
  mutation: () =>
    $fetch(`/api/master/bookings/${props.booking.id}`, {
      method: 'PATCH',
      body: { status: 'confirmed' },
    }),
  onSuccess: () => {
    queryCache.invalidateQueries({ key: bookingsQuery.key })
    queryCache.invalidateQueries({ key: analyticsQuery.key })
  },
  onError: () => toast.add({ title: t('errors.general'), color: 'error' }),
})

const { mutate: cancel, asyncStatus: cancelStatus } = useMutation({
  mutation: () =>
    $fetch(`/api/master/bookings/${props.booking.id}`, {
      method: 'PATCH',
      body: { status: 'cancelled' },
    }),
  onSuccess: () => {
    queryCache.invalidateQueries({ key: bookingsQuery.key })
    queryCache.invalidateQueries({ key: analyticsQuery.key })
  },
  onError: () => toast.add({ title: t('errors.general'), color: 'error' }),
})

const confirming = computed(() => confirmStatus.value === 'loading')
const cancelling = computed(() => cancelStatus.value === 'loading')

const serviceName = computed(() => props.booking.services?.name ?? '—')
const clientName = computed(() => props.booking.clients?.name ?? '—')
const servicePrice = computed(() => props.booking.services?.price)

const isCompletable = computed(() => props.booking.status === 'confirmed')

const isCancellable = computed(
  () => props.booking.status === 'pending' || props.booking.status === 'confirmed',
)

const statusColor = computed(() => {
  switch (props.booking.status) {
    case 'confirmed':
      return 'success' as const
    case 'pending':
      return 'warning' as const
    case 'completed':
      return 'neutral' as const
    case 'cancelled':
      return 'error' as const
    default:
      return 'neutral' as const
  }
})

const { locale } = useI18n()

const formattedTime = computed(() => {
  const date = new Date(props.booking.starts_at)
  return date.toLocaleString(locale.value, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
})

function onComplete() {
  openCheckout(props.booking)
}
</script>
