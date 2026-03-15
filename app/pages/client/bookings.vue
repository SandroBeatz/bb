<template>
  <main class="mx-auto max-w-2xl px-4 py-8">
    <h1 class="mb-6 text-2xl font-bold">
      {{ $t('pages.client.bookings') }}
    </h1>

    <template v-if="pending">
      <USkeleton
        v-for="i in 3"
        :key="i"
        class="mb-4 h-28 rounded-xl"
      />
    </template>

    <template v-else>
      <UEmpty
        v-if="!bookings?.length"
        icon="i-heroicons-calendar"
        :description="$t('pages.client.bookingsPage.emptyAll')"
      >
        <template #actions>
          <UButton
            :to="localePath('/')"
            color="primary"
          >
            {{ $t('pages.client.findMasters') }}
          </UButton>
        </template>
      </UEmpty>

      <UTabs
        v-else
        :items="tabItems"
        variant="underline"
        color="neutral"
        class="w-full"
      >
        <template #upcoming>
          <div class="space-y-4 py-4">
            <UEmpty
              v-if="!upcomingBookings.length"
              icon="i-heroicons-calendar"
              :description="$t('pages.client.bookingsPage.emptyUpcoming')"
            />
            <UCard
              v-for="booking in upcomingBookings"
              :key="booking.id"
              class="rounded-xl"
            >
              <div class="flex items-start gap-3">
                <UAvatar
                  :src="booking.profiles?.avatar_url ?? undefined"
                  :alt="booking.profiles?.full_name ?? ''"
                  size="sm"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="truncate font-medium">
                        {{ booking.profiles?.full_name }}
                      </p>
                      <p class="text-sm text-muted">
                        {{ booking.services?.name }}
                      </p>
                      <p class="text-sm text-muted">
                        {{ formatDateTime(booking.starts_at) }}
                      </p>
                    </div>
                    <div class="flex shrink-0 flex-col items-end gap-1.5">
                      <UBadge
                        :color="statusColor(booking.status)"
                        variant="soft"
                        size="sm"
                      >
                        {{ $t(`status.${booking.status}`) }}
                      </UBadge>
                      <p class="text-sm font-medium">
                        {{ formatPrice(booking.services?.price) }}
                      </p>
                    </div>
                  </div>
                  <div
                    v-if="canCancel(booking)"
                    class="mt-3 flex justify-end"
                  >
                    <UButton
                      color="error"
                      variant="ghost"
                      size="sm"
                      @click="openCancelModal(booking)"
                    >
                      {{ $t('pages.client.bookingsPage.cancelAction') }}
                    </UButton>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </template>

        <template #past>
          <div class="space-y-4 py-4">
            <UEmpty
              v-if="!pastBookings.length"
              icon="i-heroicons-clock"
              :description="$t('pages.client.bookingsPage.emptyPast')"
            />
            <UCard
              v-for="booking in pastBookings"
              :key="booking.id"
              class="rounded-xl"
            >
              <div class="flex items-start gap-3">
                <UAvatar
                  :src="booking.profiles?.avatar_url ?? undefined"
                  :alt="booking.profiles?.full_name ?? ''"
                  size="sm"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="truncate font-medium">
                        {{ booking.profiles?.full_name }}
                      </p>
                      <p class="text-sm text-muted">
                        {{ booking.services?.name }}
                      </p>
                      <p class="text-sm text-muted">
                        {{ formatDateTime(booking.starts_at) }}
                      </p>
                    </div>
                    <div class="flex shrink-0 flex-col items-end gap-1.5">
                      <UBadge
                        :color="statusColor(booking.status)"
                        variant="soft"
                        size="sm"
                      >
                        {{ $t(`status.${booking.status}`) }}
                      </UBadge>
                      <p class="text-sm font-medium">
                        {{ formatPrice(booking.services?.price) }}
                      </p>
                    </div>
                  </div>
                  <div
                    v-if="canLeaveReview(booking)"
                    class="mt-3 flex justify-end"
                  >
                    <UButton
                      color="primary"
                      variant="ghost"
                      size="sm"
                      :to="localePath(`/master/${booking.profiles?.username}`)"
                    >
                      {{ $t('pages.client.bookingsPage.leaveReview') }}
                    </UButton>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </template>
      </UTabs>
    </template>

    <UModal
      v-model:open="cancelModalOpen"
      :title="$t('pages.client.bookingsPage.cancelModal.title')"
    >
      <template #body>
        <p class="text-muted">
          {{ $t('pages.client.bookingsPage.cancelModal.message') }}
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            color="neutral"
            variant="outline"
            @click="cancelModalOpen = false"
          >
            {{ $t('pages.client.bookingsPage.cancelModal.back') }}
          </UButton>
          <UButton
            color="error"
            :loading="cancelLoading"
            @click="confirmCancel"
          >
            {{ $t('pages.client.bookingsPage.cancelModal.confirm') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </main>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database.types'

type BookingRow = Database['public']['Tables']['bookings']['Row']

interface Booking extends BookingRow {
  services: { name: string; price: number } | null
  profiles: { full_name: string; username: string | null; avatar_url: string | null } | null
  reviews: { id: string }[]
}

definePageMeta({ middleware: 'client-only' })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const { data: bookings, pending, refresh } = await useFetch<Booking[]>('/api/me/bookings')

const CANCEL_HOURS_BEFORE = 24

const tabItems = computed(() => [
  { label: t('pages.client.bookingsPage.tabs.upcoming'), slot: 'upcoming' },
  { label: t('pages.client.bookingsPage.tabs.past'), slot: 'past' },
])

const upcomingBookings = computed(() =>
  (bookings.value ?? []).filter(
    (b) => new Date(b.starts_at) > new Date() && !['cancelled', 'completed'].includes(b.status),
  ),
)

const pastBookings = computed(() =>
  (bookings.value ?? []).filter(
    (b) => new Date(b.starts_at) <= new Date() || ['cancelled', 'completed'].includes(b.status),
  ),
)

function canCancel(booking: Booking): boolean {
  if (['cancelled', 'completed'].includes(booking.status)) return false
  const hoursUntil = (new Date(booking.starts_at).getTime() - Date.now()) / (1000 * 60 * 60)
  return hoursUntil >= CANCEL_HOURS_BEFORE
}

function canLeaveReview(booking: Booking): boolean {
  return (
    booking.status === 'completed' &&
    booking.profiles?.username != null &&
    (!booking.reviews || booking.reviews.length === 0)
  )
}

function statusColor(status: string): 'warning' | 'success' | 'error' | 'neutral' | 'primary' {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'confirmed':
      return 'success'
    case 'cancelled':
      return 'error'
    case 'completed':
      return 'neutral'
    default:
      return 'neutral'
  }
}

function formatDateTime(isoString: string): string {
  return new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString))
}

function formatPrice(price?: number | null): string {
  if (price == null) return ''
  return `${price} ${t('services.currency')}`
}

const cancelModalOpen = ref(false)
const cancelLoading = ref(false)
const bookingToCancel = ref<Booking | null>(null)

function openCancelModal(booking: Booking) {
  bookingToCancel.value = booking
  cancelModalOpen.value = true
}

async function confirmCancel() {
  if (!bookingToCancel.value) return
  cancelLoading.value = true
  try {
    await $fetch(`/api/me/bookings/${bookingToCancel.value.id}/cancel`, {
      method: 'PATCH',
    })
    toast.add({
      title: t('pages.client.bookingsPage.toast.cancelSuccess'),
      color: 'success',
    })
    cancelModalOpen.value = false
    bookingToCancel.value = null
    await refresh()
  } catch {
    toast.add({
      title: t('pages.client.bookingsPage.toast.cancelError'),
      color: 'error',
    })
  } finally {
    cancelLoading.value = false
  }
}
</script>
