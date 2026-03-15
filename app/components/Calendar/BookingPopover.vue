<template>
  <div class="divide-y divide-default">
    <!-- Header: status + time -->
    <div class="p-4 space-y-2">
      <div class="flex items-center gap-2 flex-wrap">
        <UBadge :color="statusColor" variant="soft" size="sm">
          {{ $t(`bookings.status.${booking.status}`) }}
        </UBadge>
        <span class="text-xs text-muted">{{ formattedTime }}</span>
      </div>
      <p class="font-semibold text-base leading-tight">
        {{ booking.services?.name ?? '—' }}
      </p>
      <div class="flex items-center gap-1.5">
        <UIcon name="i-heroicons-user" class="size-3.5 shrink-0 text-muted" />
        <p class="text-sm text-muted truncate">
          {{ booking.profiles?.full_name ?? '—' }}
        </p>
      </div>
      <div v-if="booking.services?.price" class="flex items-center gap-1.5">
        <UIcon name="i-heroicons-banknotes" class="size-3.5 shrink-0 text-muted" />
        <p class="text-sm text-muted">
          {{ booking.services.price }} {{ $t('services.currency') }}
        </p>
      </div>
      <div v-if="booking.source" class="flex items-center gap-1.5">
        <UIcon name="i-heroicons-link" class="size-3.5 shrink-0 text-muted" />
        <p class="text-sm text-muted">
          {{ $t(`calendar.source.${booking.source}`) }}
        </p>
      </div>
    </div>

    <!-- Notes -->
    <div class="p-4 space-y-2">
      <p class="text-xs font-medium text-muted uppercase tracking-wide">
        {{ $t('calendar.notes') }}
      </p>
      <UTextarea
        v-model="localNotes"
        :placeholder="$t('calendar.notesPlaceholder')"
        :rows="2"
        size="sm"
        class="w-full"
      />
      <UButton
        size="xs"
        variant="soft"
        color="neutral"
        :loading="savingNotes"
        @click="emit('notesSaved', booking.id, localNotes)"
      >
        {{ $t('common.save') }}
      </UButton>
    </div>

    <!-- Actions -->
    <div class="p-4 flex flex-wrap gap-2">
      <UButton
        v-if="booking.status === 'pending'"
        color="success"
        variant="soft"
        size="sm"
        icon="i-heroicons-check"
        :loading="actionLoading"
        @click="emit('confirmed', booking.id)"
      >
        {{ $t('common.confirm') }}
      </UButton>
      <UButton
        v-if="booking.status === 'confirmed'"
        color="success"
        variant="soft"
        size="sm"
        icon="i-heroicons-check-circle"
        @click="emit('completed', booking)"
      >
        {{ $t('checkout.completeSession') }}
      </UButton>
      <UButton
        v-if="['pending', 'confirmed'].includes(booking.status)"
        color="error"
        variant="ghost"
        size="sm"
        icon="i-heroicons-x-mark"
        :loading="cancelLoading"
        @click="emit('cancelled', booking.id)"
      >
        {{ $t('common.cancel') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Booking, BookingStatus } from '~/types'

type BookingWithDetails = Booking & {
  services?: { name: string; price: number; duration_minutes: number } | null
  profiles?: { full_name: string; avatar_url: string | null } | null
}

const props = defineProps<{
  booking: BookingWithDetails
  actionLoading?: boolean
  cancelLoading?: boolean
  savingNotes?: boolean
}>()

const emit = defineEmits<{
  confirmed: [id: string]
  cancelled: [id: string]
  completed: [booking: BookingWithDetails]
  notesSaved: [id: string, notes: string]
}>()

const { locale } = useI18n()

const localNotes = ref(props.booking.notes ?? '')

watch(
  () => props.booking.notes,
  (val) => {
    localNotes.value = val ?? ''
  },
)

const formattedTime = computed(() => {
  const start = new Date(props.booking.starts_at)
  const end = new Date(props.booking.ends_at)
  const dateStr = start.toLocaleDateString(locale.value, { day: '2-digit', month: '2-digit' })
  const startTime = start.toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' })
  const endTime = end.toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' })
  return `${dateStr} · ${startTime} – ${endTime}`
})

const statusColor = computed(() => {
  switch (props.booking.status as BookingStatus) {
    case 'confirmed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'completed':
      return 'neutral'
    case 'cancelled':
      return 'error'
    default:
      return 'neutral'
  }
})
</script>
