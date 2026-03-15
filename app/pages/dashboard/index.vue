<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :toggle="false" :title="$t('nav.dashboard')" />
    </template>

    <template #body>
    <UContainer class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Today -->
        <UCard class="rounded-2xl p-4">
          <p class="text-sm text-muted">{{ $t('dashboard.kpi.today') }}</p>
          <p class="text-2xl font-semibold mt-1">{{ analytics?.todayBookings ?? 0 }}</p>
          <p class="text-sm text-muted mt-0.5">
            {{ analytics?.todayRevenue ?? 0 }} {{ $t('services.currency') }}
          </p>
        </UCard>

        <!-- Pending confirmation -->
        <UCard class="rounded-2xl p-4">
          <div class="flex items-center justify-between">
            <p class="text-sm text-muted">{{ $t('dashboard.kpi.pending') }}</p>
            <UBadge
              v-if="(analytics?.pendingBookings ?? 0) > 0"
              color="warning"
              variant="soft"
              class="animate-pulse"
            >
              {{ analytics?.pendingBookings }}
            </UBadge>
          </div>
          <p class="text-2xl font-semibold mt-1">{{ analytics?.pendingBookings ?? 0 }}</p>
        </UCard>

        <!-- Month revenue -->
        <UCard class="rounded-2xl p-4">
          <p class="text-sm text-muted">{{ $t('dashboard.kpi.monthRevenue') }}</p>
          <p class="text-2xl font-semibold mt-1">
            {{ analytics?.monthRevenue ?? 0 }} {{ $t('services.currency') }}
          </p>
        </UCard>
      </div>

      <!-- Today's bookings -->
      <div>
        <h3 class="text-base font-semibold mb-4">{{ $t('bookings.today') }}</h3>

        <div v-if="loading" class="space-y-3">
          <USkeleton v-for="i in 3" :key="i" class="h-20 rounded-xl" />
        </div>

        <div v-else-if="todayBookings.length === 0">
          <UEmpty
            icon="i-heroicons-calendar-days"
            :title="$t('bookings.empty')"
            :description="$t('bookings.emptyDescription')"
          />
        </div>

        <div v-else class="space-y-3">
          <BookingCard
            v-for="booking in todayBookings"
            :key="booking.id"
            :booking="booking"
            @refresh="fetchData"
          />
        </div>
      </div>
    </UContainer>

    <CheckoutQuickCheckoutModal @success="fetchData" />
    </template>
  </UDashboardPanel>

  <!-- FAB (mobile only) -->
  <UDropdownMenu :items="fabItems">
    <UButton
      class="fixed bottom-20 right-4 md:hidden rounded-full shadow-lg size-14"
      color="primary"
      icon="i-heroicons-plus"
      size="xl"
    />
  </UDropdownMenu>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { t } = useI18n()
const localePath = useLocalePath()

const cache = useDashboardCache()
const { bookings, bookingsLoading, bookingsReady, analytics } = storeToRefs(cache)

const loading = computed(() => !bookingsReady.value || (bookingsLoading.value && !bookings.value.length))

const todayStr = new Date().toISOString().slice(0, 10)

const todayBookings = computed(() => {
  return bookings.value
    .filter((b) => b.starts_at.slice(0, 10) === todayStr)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
})

const fabItems = computed(() => [
  [
    {
      label: t('dashboard.fab.addBooking'),
      icon: 'i-heroicons-calendar-days',
      to: localePath('/dashboard/calendar'),
    },
    {
      label: t('dashboard.fab.blockTime'),
      icon: 'i-heroicons-no-symbol',
      to: localePath('/dashboard/calendar'),
    },
  ],
])

async function fetchData() {
  await Promise.all([cache.fetchBookings(), cache.fetchAnalytics()])
}

onMounted(() => {
  fetchData()
})
</script>
