<template>
  <UDashboardPanel :ui="{ body: 'flex-1 overflow-hidden p-0' }">
    <template #header>
      <UDashboardNavbar :toggle="false" :title="$t('nav.calendar')" icon="i-heroicons-calendar-days">
        <template #right>
          <UButton
            variant="ghost"
            color="neutral"
            size="sm"
            icon="i-heroicons-arrow-path"
            :loading="loading"
            @click="refresh"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="h-full overflow-hidden">
        <ClientOnly>
          <CalendarView
            :events="calendarEvents"
            :locale="locale"
            @event-click="handleEventClick"
            @date-click="handleDateClick"
            @dates-set="handleDatesSet"
          />

          <template #fallback>
            <div class="h-full p-4">
              <USkeleton class="h-full w-full rounded-lg" />
            </div>
          </template>
        </ClientOnly>
      </div>

      <!-- Booking details slideover -->
      <USlideover
        v-model:open="isSlideoverOpen"
        :title="selectedBooking?.services?.name ?? $t('nav.calendar')"
        side="right"
      >
        <template #body>
          <BookingPopover
            v-if="selectedBooking"
            :booking="selectedBooking"
            :action-loading="actionLoading"
            :cancel-loading="cancelLoading"
            :saving-notes="savingNotes"
            @confirmed="confirmBooking"
            @cancelled="cancelBooking"
            @completed="completeBooking"
            @notes-saved="saveNotes"
            @time-updated="updateBookingTime"
          />
        </template>
      </USlideover>

      <!-- Add booking modal -->
      <AddBookingModal
        v-model:open="isNewSlotModalOpen"
        :default-datetime="clickedDatetime"
        @created="refresh"
      />

      <QuickCheckoutModal @success="refresh" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { Booking, BookingStatus } from '~/types'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })

type BookingWithDetails = Booking & {
  services?: { name: string; price: number; duration_minutes: number } | null
  profiles?: { full_name: string; avatar_url: string | null } | null
}

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor: string
  borderColor: string
  textColor: string
  extendedProps: Record<string, unknown>
}

const STATUS_COLORS: Record<BookingStatus, { background: string; border: string }> = {
  pending: { background: '#F59E0B', border: '#D97706' },
  confirmed: { background: '#10B981', border: '#059669' },
  completed: { background: '#9CA3AF', border: '#6B7280' },
  cancelled: { background: '#F87171', border: '#EF4444' },
}

const { t, locale } = useI18n()
const toast = useToast()
const { openCheckout } = useQuickCheckout()

const loading = ref(false)
const bookings = ref<BookingWithDetails[]>([])
const currentRange = ref<{ from: string; to: string } | null>(null)

// Slideover state
const isSlideoverOpen = ref(false)
const selectedBooking = ref<BookingWithDetails | null>(null)

// New slot modal state
const isNewSlotModalOpen = ref(false)
const clickedDatetime = ref<string | null>(null)

// Per-action loading states for the currently selected booking
const actionLoading = ref(false)
const cancelLoading = ref(false)
const savingNotes = ref(false)

// Fast lookup: booking id → booking
const bookingMap = computed(() => {
  const map = new Map<string, BookingWithDetails>()
  for (const b of bookings.value) {
    map.set(b.id, b)
  }
  return map
})

const calendarEvents = computed<CalendarEvent[]>(() =>
  bookings.value.map((b) => ({
    id: b.id,
    title: [b.services?.name, b.clients?.name].filter(Boolean).join(' · '),
    start: b.starts_at,
    end: b.ends_at,
    backgroundColor: STATUS_COLORS[b.status]?.background ?? '#9CA3AF',
    borderColor: STATUS_COLORS[b.status]?.border ?? '#6B7280',
    textColor: '#ffffff',
    extendedProps: {
      status: b.status,
      clientName: b.clients?.name ?? '',
      servicePrice: b.services?.price ?? null,
      source: b.source,
    },
  })),
)

async function fetchBookings(range?: { from: string; to: string }): Promise<void> {
  loading.value = true
  try {
    const params: Record<string, string> = {}
    if (range) {
      params.from = range.from
      params.to = range.to
    }
    const data = await $fetch<BookingWithDetails[]>('/api/master/bookings', { params })
    bookings.value = data ?? []
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    loading.value = false
  }
}

// Called when FullCalendar visible range changes (initial render + navigation + view switch)
function handleDatesSet(info: { startStr: string; endStr: string }) {
  currentRange.value = { from: info.startStr, to: info.endStr }
  fetchBookings(currentRange.value)
}

// Manual refresh — re-fetch the current visible range
function refresh() {
  fetchBookings(currentRange.value ?? undefined)
}

function handleEventClick(info: { event: { id: string } }) {
  const booking = bookingMap.value.get(String(info.event.id))
  if (booking) {
    selectedBooking.value = booking
    isSlideoverOpen.value = true
  }
}

function handleDateClick(info: { dateStr: string }) {
  clickedDatetime.value = info.dateStr
  isNewSlotModalOpen.value = true
}

async function confirmBooking(id: string): Promise<void> {
  actionLoading.value = true
  try {
    await $fetch(`/api/master/bookings/${id}`, {
      method: 'PATCH',
      body: { status: 'confirmed' },
    })
    await fetchBookings(currentRange.value ?? undefined)
    const updated = bookingMap.value.get(id)
    if (updated) selectedBooking.value = updated
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    actionLoading.value = false
  }
}

async function cancelBooking(id: string): Promise<void> {
  cancelLoading.value = true
  try {
    await $fetch(`/api/master/bookings/${id}`, {
      method: 'PATCH',
      body: { status: 'cancelled' },
    })
    await fetchBookings(currentRange.value ?? undefined)
    isSlideoverOpen.value = false
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    cancelLoading.value = false
  }
}

function completeBooking(booking: BookingWithDetails): void {
  openCheckout(booking)
  isSlideoverOpen.value = false
}

async function saveNotes(id: string, notes: string): Promise<void> {
  savingNotes.value = true
  try {
    await $fetch(`/api/master/bookings/${id}`, {
      method: 'PATCH',
      body: { notes },
    })
    const idx = bookings.value.findIndex((b) => b.id === id)
    if (idx !== -1) {
      bookings.value[idx] = { ...bookings.value[idx], notes }
      if (selectedBooking.value?.id === id) {
        selectedBooking.value = { ...selectedBooking.value, notes }
      }
    }
    toast.add({ title: t('common.success'), color: 'success' })
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    savingNotes.value = false
  }
}

async function updateBookingTime(id: string, starts_at: string, ends_at: string): Promise<void> {
  try {
    await $fetch(`/api/master/bookings/${id}`, {
      method: 'PATCH',
      body: { starts_at, ends_at },
    })
    await fetchBookings(currentRange.value ?? undefined)
    const updated = bookingMap.value.get(id)
    if (updated) selectedBooking.value = updated
    toast.add({ title: t('common.success'), color: 'success' })
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  }
}
</script>
