<template>
  <UCard>
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
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Booking } from '~/types'

type BookingWithDetails = Booking & {
  services?: { name: string; price: number; duration_minutes: number } | null
  profiles?: { full_name: string; avatar_url: string | null } | null
}

const props = defineProps<{
  booking: BookingWithDetails
}>()

const { openCheckout } = useQuickCheckout()

const serviceName = computed(() => props.booking.services?.name ?? '—')
const clientName = computed(() => props.booking.profiles?.full_name ?? '—')
const servicePrice = computed(() => props.booking.services?.price)

const isCompletable = computed(() =>
  props.booking.status === 'pending' || props.booking.status === 'confirmed',
)

const statusColor = computed(() => {
  switch (props.booking.status) {
    case 'confirmed': return 'success' as const
    case 'pending': return 'warning' as const
    case 'completed': return 'neutral' as const
    case 'cancelled': return 'error' as const
    default: return 'neutral' as const
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
