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

    <!-- Edit time & duration -->
    <div class="p-4 space-y-3">
      <div class="flex items-center justify-between">
        <p class="text-xs font-medium text-muted uppercase tracking-wide">
          {{ $t('calendar.editTime.title') }}
        </p>
        <UButton
          v-if="!editingTime"
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-heroicons-pencil"
          @click="startEditTime"
        >
          {{ $t('common.edit') }}
        </UButton>
      </div>

      <div v-if="editingTime" class="space-y-3">
        <div class="grid grid-cols-2 gap-2">
          <UFormField :label="$t('calendar.addBooking.date')" size="sm">
            <UInput v-model="editDate" type="date" size="sm" class="w-full" />
          </UFormField>
          <UFormField :label="$t('calendar.addBooking.time')" size="sm">
            <UInput v-model="editTime" type="time" size="sm" class="w-full" />
          </UFormField>
        </div>
        <UFormField :label="$t('calendar.editTime.duration')" size="sm">
          <USelect
            v-model="editDuration"
            :items="durationOptions"
            size="sm"
            class="w-full"
          />
        </UFormField>
        <div class="flex gap-2">
          <UButton
            size="xs"
            color="primary"
            :loading="savingTime"
            @click="saveTime"
          >
            {{ $t('common.save') }}
          </UButton>
          <UButton size="xs" variant="ghost" color="neutral" @click="editingTime = false">
            {{ $t('common.cancel') }}
          </UButton>
        </div>
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
  timeUpdated: [id: string, starts_at: string, ends_at: string]
}>()

const { locale } = useI18n()

const localNotes = ref(props.booking.notes ?? '')

watch(
  () => props.booking.notes,
  (val) => {
    localNotes.value = val ?? ''
  },
)

// ── Edit time ────────────────────────────────────────────────────
const editingTime = ref(false)
const savingTime = ref(false)
const editDate = ref('')
const editTime = ref('')
const editDuration = ref(30)

const durationOptions = [
  { label: '15 мин', value: 15 },
  { label: '20 мин', value: 20 },
  { label: '30 мин', value: 30 },
  { label: '45 мин', value: 45 },
  { label: '1 час', value: 60 },
  { label: '1.5 часа', value: 90 },
  { label: '2 часа', value: 120 },
  { label: '3 часа', value: 180 },
]

function startEditTime() {
  const start = new Date(props.booking.starts_at)
  const end = new Date(props.booking.ends_at)
  editDate.value = start.toISOString().slice(0, 10)
  editTime.value = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`
  editDuration.value = Math.round((end.getTime() - start.getTime()) / 60_000)
  editingTime.value = true
}

async function saveTime() {
  savingTime.value = true
  try {
    const startsAt = new Date(`${editDate.value}T${editTime.value}:00`)
    const endsAt = new Date(startsAt.getTime() + editDuration.value * 60_000)
    emit('timeUpdated', props.booking.id, startsAt.toISOString(), endsAt.toISOString())
    editingTime.value = false
  } finally {
    savingTime.value = false
  }
}

// ── Display ──────────────────────────────────────────────────────
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
