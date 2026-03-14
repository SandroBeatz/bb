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
          @click="onConfirm"
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
          @click="onCancel"
        >
          {{ $t('common.cancel') }}
        </UButton>
      </div>
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

const emit = defineEmits<{
  refresh: []
}>()

const { openCheckout } = useQuickCheckout()
const toast = useToast()

const confirming = ref(false)
const cancelling = ref(false)

const serviceName = computed(() => props.booking.services?.name ?? '—')
const clientName = computed(() => props.booking.profiles?.full_name ?? '—')
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

const { t, locale } = useI18n()

const formattedTime = computed(() => {
  const date = new Date(props.booking.starts_at)
  return date.toLocaleString(locale.value, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
})

async function onConfirm() {
  confirming.value = true
  try {
    await $fetch(`/api/master/bookings/${props.booking.id}`, {
      method: 'PATCH',
      body: { status: 'confirmed' },
    })
    emit('refresh')
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    confirming.value = false
  }
}

async function onCancel() {
  cancelling.value = true
  try {
    await $fetch(`/api/master/bookings/${props.booking.id}`, {
      method: 'PATCH',
      body: { status: 'cancelled' },
    })
    emit('refresh')
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    cancelling.value = false
  }
}

function onComplete() {
  openCheckout(props.booking)
}
</script>
