<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="$t('nav.calendar')" icon="i-heroicons-calendar-days">
        <template #right>
          <UButton
            variant="ghost"
            color="neutral"
            size="sm"
            icon="i-heroicons-arrow-path"
            :loading="loading"
            @click="fetchBookings"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <div class="h-full overflow-hidden">
      <NuxtCalendar
        :events="calendarEvents"
        :teams="statusTeams"
        slot-height="viewport"
      >
        <template #event-panel="{ event }">
          <!-- Existing booking details -->
          <template v-if="event.id !== 'new' && bookingMap.has(String(event.id))">
            <div class="min-w-72 divide-y divide-default">
              <!-- Header: status + time -->
              <div class="p-4 space-y-2">
                <div class="flex items-center gap-2 flex-wrap">
                  <UBadge :color="statusColor(getBooking(event.id)?.status)" variant="soft" size="sm">
                    {{ $t(`bookings.status.${getBooking(event.id)?.status}`) }}
                  </UBadge>
                  <span class="text-xs text-muted">
                    {{ formatBookingTime(getBooking(event.id)) }}
                  </span>
                </div>
                <!-- Service -->
                <p class="font-semibold text-base leading-tight">
                  {{ getBooking(event.id)?.services?.name ?? '—' }}
                </p>
                <!-- Client -->
                <div class="flex items-center gap-1.5">
                  <UIcon name="i-heroicons-user" class="size-3.5 shrink-0 text-muted" />
                  <p class="text-sm text-muted truncate">
                    {{ getBooking(event.id)?.profiles?.full_name ?? '—' }}
                  </p>
                </div>
                <!-- Price -->
                <div v-if="getBooking(event.id)?.services?.price" class="flex items-center gap-1.5">
                  <UIcon name="i-heroicons-banknotes" class="size-3.5 shrink-0 text-muted" />
                  <p class="text-sm text-muted">
                    {{ getBooking(event.id)?.services?.price }} {{ $t('services.currency') }}
                  </p>
                </div>
                <!-- Source -->
                <div v-if="getBooking(event.id)?.source" class="flex items-center gap-1.5">
                  <UIcon name="i-heroicons-link" class="size-3.5 shrink-0 text-muted" />
                  <p class="text-sm text-muted">
                    {{ $t(`calendar.source.${getBooking(event.id)?.source}`) }}
                  </p>
                </div>
              </div>

              <!-- Notes -->
              <div class="p-4 space-y-2">
                <p class="text-xs font-medium text-muted uppercase tracking-wide">
                  {{ $t('calendar.notes') }}
                </p>
                <UTextarea
                  v-model="notesMap[String(event.id)]"
                  :placeholder="$t('calendar.notesPlaceholder')"
                  :rows="2"
                  size="sm"
                  class="w-full"
                />
                <UButton
                  size="xs"
                  variant="soft"
                  color="neutral"
                  :loading="savingNotes[String(event.id)]"
                  @click="saveNotes(event.id)"
                >
                  {{ $t('common.save') }}
                </UButton>
              </div>

              <!-- Actions -->
              <div class="p-4 flex flex-wrap gap-2">
                <UButton
                  v-if="getBooking(event.id)?.status === 'pending'"
                  color="success"
                  variant="soft"
                  size="sm"
                  icon="i-heroicons-check"
                  :loading="actionLoading[String(event.id)]"
                  @click="confirmBooking(event.id)"
                >
                  {{ $t('common.confirm') }}
                </UButton>
                <UButton
                  v-if="getBooking(event.id)?.status === 'confirmed'"
                  color="success"
                  variant="soft"
                  size="sm"
                  icon="i-heroicons-check-circle"
                  @click="completeBooking(event.id)"
                >
                  {{ $t('checkout.completeSession') }}
                </UButton>
                <UButton
                  v-if="['pending', 'confirmed'].includes(getBooking(event.id)?.status ?? '')"
                  color="error"
                  variant="ghost"
                  size="sm"
                  icon="i-heroicons-x-mark"
                  :loading="cancelLoading[String(event.id)]"
                  @click="cancelBooking(event.id)"
                >
                  {{ $t('common.cancel') }}
                </UButton>
              </div>
            </div>
          </template>

          <!-- New event (empty slot clicked) -->
          <template v-else-if="event.id === 'new'">
            <div class="p-4 min-w-56 space-y-3">
              <p class="text-sm font-semibold text-highlighted">
                {{ $t('calendar.addOrBlock') }}
              </p>
              <UButton
                variant="soft"
                color="primary"
                size="sm"
                icon="i-heroicons-calendar-days"
                class="w-full justify-start"
                :to="localePath('/dashboard/calendar')"
              >
                {{ $t('dashboard.fab.addBooking') }}
              </UButton>
              <UButton
                variant="soft"
                color="neutral"
                size="sm"
                icon="i-heroicons-no-symbol"
                class="w-full justify-start"
              >
                {{ $t('dashboard.fab.blockTime') }}
              </UButton>
            </div>
          </template>
        </template>
      </NuxtCalendar>
    </div>

    <CheckoutQuickCheckoutModal @success="fetchBookings" />
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { Booking, BookingStatus } from '~/types'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })

type BookingWithDetails = Booking & {
  services?: { name: string; price: number; duration_minutes: number } | null
  profiles?: { full_name: string; avatar_url: string | null } | null
}

const STATUS_COLORS = {
  pending: {
    background: '#F59E0B',
    border: '#D97706',
    backgroundDimmed: '#FEF3C7',
  },
  confirmed: {
    background: '#10B981',
    border: '#059669',
    backgroundDimmed: '#D1FAE5',
  },
  completed: {
    background: '#9CA3AF',
    border: '#6B7280',
    backgroundDimmed: '#F3F4F6',
  },
  cancelled: {
    background: '#F87171',
    border: '#EF4444',
    backgroundDimmed: '#FEE2E2',
  },
} as const

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const { openCheckout } = useQuickCheckout()

const loading = ref(false)
const bookings = ref<BookingWithDetails[]>([])

// Reactive maps: booking id -> value
const notesMap = reactive<Record<string, string>>({})
const savingNotes = reactive<Record<string, boolean>>({})
const actionLoading = reactive<Record<string, boolean>>({})
const cancelLoading = reactive<Record<string, boolean>>({})

const statusTeams = [
  {
    id: 'booking-status',
    name: 'Status',
    members: [
      {
        id: 'pending',
        name: t('bookings.status.pending'),
        color: STATUS_COLORS.pending,
        visible: true,
      },
      {
        id: 'confirmed',
        name: t('bookings.status.confirmed'),
        color: STATUS_COLORS.confirmed,
        visible: true,
      },
      {
        id: 'completed',
        name: t('bookings.status.completed'),
        color: STATUS_COLORS.completed,
        visible: true,
      },
      {
        id: 'cancelled',
        name: t('bookings.status.cancelled'),
        color: STATUS_COLORS.cancelled,
        visible: true,
      },
    ],
  },
]

// Fast lookup map: booking id -> booking
const bookingMap = computed(() => {
  const map = new Map<string, BookingWithDetails>()
  for (const b of bookings.value) {
    map.set(b.id, b)
  }
  return map
})

// Initialize notesMap when bookings are loaded; clean up stale entries
watch(bookings, (newBookings) => {
  const currentIds = new Set(newBookings.map(b => b.id))
  for (const key of Object.keys(notesMap)) {
    if (!currentIds.has(key)) {
      delete notesMap[key]
    }
  }
  for (const b of newBookings) {
    if (!(b.id in notesMap)) {
      notesMap[b.id] = b.notes ?? ''
    }
  }
})

// Map bookings to NuxtCalendar events
const calendarEvents = computed(() =>
  bookings.value.map((b) => {
    const start = new Date(b.starts_at)
    const end = new Date(b.ends_at)
    return {
      id: b.id,
      title: b.services?.name ?? '—',
      description: b.profiles?.full_name ?? '',
      start,
      end,
      date: start,
      startTime: `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`,
      endTime: `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`,
      teamId: 'booking-status',
      teamMemberId: b.status,
    }
  }),
)

function getBooking(id: string | number): BookingWithDetails | undefined {
  return bookingMap.value.get(String(id))
}

function statusColor(status?: string): 'success' | 'warning' | 'neutral' | 'error' {
  switch (status as BookingStatus) {
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
}

function formatBookingTime(booking?: BookingWithDetails): string {
  if (!booking) return ''
  const start = new Date(booking.starts_at)
  const end = new Date(booking.ends_at)
  const dateStr = start.toLocaleDateString(locale.value, {
    day: '2-digit',
    month: '2-digit',
  })
  const startTime = start.toLocaleTimeString(locale.value, {
    hour: '2-digit',
    minute: '2-digit',
  })
  const endTime = end.toLocaleTimeString(locale.value, {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${dateStr} · ${startTime} – ${endTime}`
}

async function fetchBookings(): Promise<void> {
  loading.value = true
  try {
    const data = await $fetch<BookingWithDetails[]>('/api/master/bookings')
    bookings.value = data ?? []
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    loading.value = false
  }
}

async function confirmBooking(id: string | number): Promise<void> {
  const key = String(id)
  actionLoading[key] = true
  try {
    await $fetch(`/api/master/bookings/${key}`, {
      method: 'PATCH',
      body: { status: 'confirmed' },
    })
    await fetchBookings()
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    actionLoading[key] = false
  }
}

async function cancelBooking(id: string | number): Promise<void> {
  const key = String(id)
  cancelLoading[key] = true
  try {
    await $fetch(`/api/master/bookings/${key}`, {
      method: 'PATCH',
      body: { status: 'cancelled' },
    })
    await fetchBookings()
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    cancelLoading[key] = false
  }
}

function completeBooking(id: string | number): void {
  const booking = getBooking(id)
  if (booking) openCheckout(booking)
}

async function saveNotes(id: string | number): Promise<void> {
  const key = String(id)
  savingNotes[key] = true
  try {
    await $fetch(`/api/master/bookings/${key}`, {
      method: 'PATCH',
      body: { notes: notesMap[key] },
    })
    const idx = bookings.value.findIndex((b) => b.id === key)
    if (idx !== -1) {
      bookings.value[idx] = { ...bookings.value[idx], notes: notesMap[key] }
    }
    toast.add({ title: t('common.success'), color: 'success' })
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    savingNotes[key] = false
  }
}

onMounted(() => {
  fetchBookings()
})
</script>
