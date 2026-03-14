<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="$t('nav.dashboard')" />
    </template>

    <div class="p-6 space-y-6">
      <div>
        <h3 class="text-base font-semibold mb-4">
          {{ $t('bookings.upcoming') }}
        </h3>

        <div v-if="loading" class="space-y-3">
          <USkeleton v-for="i in 3" :key="i" class="h-20 rounded-xl" />
        </div>

        <div v-else-if="upcomingBookings.length === 0">
          <UEmpty
            icon="i-heroicons-calendar-days"
            :title="$t('bookings.empty')"
            :description="$t('bookings.emptyDescription')"
          />
        </div>

        <div v-else class="space-y-3">
          <BookingCard
            v-for="booking in upcomingBookings"
            :key="booking.id"
            :booking="booking"
          />
        </div>
      </div>
    </div>

    <CheckoutQuickCheckoutModal @success="fetchBookings" />
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { Booking } from '~/types'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })

type BookingWithDetails = Booking & {
  services?: { name: string; price: number; duration_minutes: number } | null
  profiles?: { full_name: string; avatar_url: string | null } | null
}

const loading = ref(false)
const bookings = ref<BookingWithDetails[]>([])

const upcomingBookings = computed(() =>
  bookings.value.filter(b => b.status === 'pending' || b.status === 'confirmed'),
)

async function fetchBookings() {
  loading.value = true
  try {
    const data = await $fetch<BookingWithDetails[]>('/api/master/bookings')
    bookings.value = data ?? []
  } catch (err) {
    console.error('Failed to fetch bookings:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBookings()
})
</script>
