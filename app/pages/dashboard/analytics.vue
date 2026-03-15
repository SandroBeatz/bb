<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar
        :toggle="false"
        :title="$t('pages.dashboard.analytics')"
        icon="i-heroicons-chart-bar"
      />
    </template>

    <template #body>
      <UContainer class="space-y-6 py-6">
        <!-- Period switcher -->
        <UTabs
          v-model="period"
          :items="periodItems"
          variant="underline"
          color="neutral"
          class="w-full"
        />

        <!-- KPI Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <UCard class="rounded-2xl p-4">
            <p class="text-sm text-muted">{{ $t('analytics.kpi.revenue') }}</p>
            <template v-if="pending">
              <USkeleton class="h-8 w-24 mt-1" />
            </template>
            <template v-else>
              <p class="text-2xl font-semibold mt-1">
                {{ formatAmount(data?.periodRevenue ?? 0) }}
              </p>
              <p class="text-sm text-muted mt-0.5">{{ $t('services.currency') }}</p>
            </template>
          </UCard>

          <UCard class="rounded-2xl p-4">
            <p class="text-sm text-muted">{{ $t('analytics.kpi.bookings') }}</p>
            <template v-if="pending">
              <USkeleton class="h-8 w-16 mt-1" />
            </template>
            <template v-else>
              <p class="text-2xl font-semibold mt-1">{{ data?.periodBookingsCount ?? 0 }}</p>
            </template>
          </UCard>

          <UCard class="rounded-2xl p-4">
            <p class="text-sm text-muted">{{ $t('analytics.kpi.avgCheck') }}</p>
            <template v-if="pending">
              <USkeleton class="h-8 w-20 mt-1" />
            </template>
            <template v-else>
              <p class="text-2xl font-semibold mt-1">
                {{ formatAmount(data?.avgCheck ?? 0) }}
              </p>
              <p class="text-sm text-muted mt-0.5">{{ $t('services.currency') }}</p>
            </template>
          </UCard>

          <UCard class="rounded-2xl p-4">
            <p class="text-sm text-muted">{{ $t('analytics.kpi.newClients') }}</p>
            <template v-if="pending">
              <USkeleton class="h-8 w-16 mt-1" />
            </template>
            <template v-else>
              <p class="text-2xl font-semibold mt-1">{{ data?.newClients ?? 0 }}</p>
            </template>
          </UCard>
        </div>

        <!-- Charts grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Revenue line chart -->
          <UCard class="rounded-2xl">
            <p class="text-sm font-medium mb-4">{{ $t('analytics.charts.revenue') }}</p>
            <template v-if="pending">
              <USkeleton class="h-52 w-full rounded-xl" />
            </template>
            <template v-else-if="hasRevenueData">
              <ClientOnly>
                <Line :data="revenueChartData" :options="lineChartOptions" class="max-h-52" />
              </ClientOnly>
            </template>
            <template v-else>
              <UEmpty
                icon="i-heroicons-chart-bar"
                :description="$t('analytics.charts.noData')"
                class="py-8"
              />
            </template>
          </UCard>

          <!-- Bookings bar chart -->
          <UCard class="rounded-2xl">
            <p class="text-sm font-medium mb-4">{{ $t('analytics.charts.bookings') }}</p>
            <template v-if="pending">
              <USkeleton class="h-52 w-full rounded-xl" />
            </template>
            <template v-else-if="hasBookingsData">
              <ClientOnly>
                <Bar :data="bookingsChartData" :options="barChartOptions" class="max-h-52" />
              </ClientOnly>
            </template>
            <template v-else>
              <UEmpty
                icon="i-heroicons-calendar-days"
                :description="$t('analytics.charts.noData')"
                class="py-8"
              />
            </template>
          </UCard>

          <!-- Payment methods doughnut -->
          <UCard class="rounded-2xl">
            <p class="text-sm font-medium mb-4">{{ $t('analytics.charts.paymentMethods') }}</p>
            <template v-if="pending">
              <USkeleton class="h-52 w-full rounded-xl" />
            </template>
            <template v-else-if="data?.paymentMethods?.length">
              <ClientOnly>
                <div class="flex justify-center">
                  <Doughnut
                    :data="paymentMethodsChartData"
                    :options="doughnutOptions"
                    class="max-h-52"
                  />
                </div>
              </ClientOnly>
            </template>
            <template v-else>
              <UEmpty
                icon="i-heroicons-credit-card"
                :description="$t('analytics.charts.noData')"
                class="py-8"
              />
            </template>
          </UCard>

          <!-- Booking sources doughnut -->
          <UCard class="rounded-2xl">
            <p class="text-sm font-medium mb-4">{{ $t('analytics.charts.bookingSources') }}</p>
            <template v-if="pending">
              <USkeleton class="h-52 w-full rounded-xl" />
            </template>
            <template v-else-if="data?.bookingSources?.length">
              <ClientOnly>
                <div class="flex justify-center">
                  <Doughnut
                    :data="bookingSourcesChartData"
                    :options="doughnutOptions"
                    class="max-h-52"
                  />
                </div>
              </ClientOnly>
            </template>
            <template v-else>
              <UEmpty
                icon="i-heroicons-arrow-trending-up"
                :description="$t('analytics.charts.noData')"
                class="py-8"
              />
            </template>
          </UCard>
        </div>

        <!-- Top services -->
        <UCard class="rounded-2xl">
          <p class="text-sm font-medium mb-4">{{ $t('analytics.charts.topServices') }}</p>
          <template v-if="pending">
            <div class="space-y-3">
              <USkeleton v-for="i in 3" :key="i" class="h-10 w-full rounded-lg" />
            </div>
          </template>
          <template v-else-if="data?.topServices?.length">
            <div class="space-y-3">
              <div
                v-for="(svc, i) in data.topServices"
                :key="i"
                class="flex items-center gap-3"
              >
                <span class="text-sm text-muted w-4 shrink-0">{{ i + 1 }}</span>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-medium truncate">{{ svc.name }}</span>
                    <span class="text-sm text-muted ml-2 shrink-0">{{ svc.count }}</span>
                  </div>
                  <div class="h-1.5 rounded-full bg-[var(--color-neutral-200)] overflow-hidden">
                    <div
                      class="h-full rounded-full bg-rose-500"
                      :style="{ width: `${serviceBarWidth(svc.count)}%` }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <UEmpty
              icon="i-heroicons-scissors"
              :description="$t('analytics.charts.noData')"
              class="py-8"
            />
          </template>
        </UCard>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { t, locale } = useI18n()

// ── Period selector ───────────────────────────────────────────────────────
const period = ref('month')

const periodItems = computed(() => [
  { label: t('analytics.period.week'), value: 'week' },
  { label: t('analytics.period.month'), value: 'month' },
  { label: t('analytics.period.quarter'), value: 'quarter' },
])

// ── Data fetching ─────────────────────────────────────────────────────────
const { data, pending } = useLazyFetch('/api/master/analytics', {
  query: { period },
  watch: [period],
})

// ── Helpers ───────────────────────────────────────────────────────────────
function formatAmount(v: number) {
  return v.toLocaleString(locale.value)
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(locale.value, { day: 'numeric', month: 'short' })
}

// ── Chart colours ─────────────────────────────────────────────────────────
const ROSE_500 = '#f43f5e'
const ROSE_300 = '#fda4af'
const ROSE_100 = '#ffe4e6'
const STONE_300 = '#d6d3d1'
const WARM_PALETTE = ['#f43f5e', '#fb923c', '#fbbf24', '#34d399', '#38bdf8', '#a78bfa']

// ── Shared chart options ──────────────────────────────────────────────────
const baseScaleConfig = {
  x: {
    grid: { display: false },
    ticks: { font: { family: 'Plus Jakarta Sans', size: 11 }, color: '#78716c' },
    border: { display: false },
  },
  y: {
    grid: { color: STONE_300 },
    ticks: { font: { family: 'Plus Jakarta Sans', size: 11 }, color: '#78716c' },
    border: { display: false },
  },
}

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      // biome-ignore lint/suspicious/noExplicitAny: chart.js callback typing
      callbacks: { label: (ctx: any) => ` ${ctx.parsed.y.toLocaleString(locale.value)} ${t('services.currency')}` },
    },
  },
  scales: baseScaleConfig,
}

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: { legend: { display: false } },
  scales: baseScaleConfig,
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: true,
  cutout: '65%',
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { font: { family: 'Plus Jakarta Sans', size: 12 }, padding: 16, boxWidth: 12 },
    },
  },
}

// ── Computed chart data ───────────────────────────────────────────────────
const revenueByDay = computed(() => data.value?.revenueByDay ?? [])
const bookingsByDay = computed(() => data.value?.bookingsByDay ?? [])

const hasRevenueData = computed(() => revenueByDay.value.some((d) => d.amount > 0))
const hasBookingsData = computed(() => bookingsByDay.value.some((d) => d.count > 0))

const revenueChartData = computed(() => ({
  labels: revenueByDay.value.map((d) => formatDateLabel(d.date)),
  datasets: [
    {
      data: revenueByDay.value.map((d) => d.amount),
      borderColor: ROSE_500,
      backgroundColor: ROSE_100,
      tension: 0.4,
      fill: true,
      pointRadius: revenueByDay.value.length <= 14 ? 4 : 2,
      pointBackgroundColor: ROSE_500,
      borderWidth: 2,
    },
  ],
}))

const bookingsChartData = computed(() => ({
  labels: bookingsByDay.value.map((d) => formatDateLabel(d.date)),
  datasets: [
    {
      data: bookingsByDay.value.map((d) => d.count),
      backgroundColor: ROSE_300,
      hoverBackgroundColor: ROSE_500,
      borderRadius: 6,
      borderSkipped: false,
    },
  ],
}))

const paymentMethodsChartData = computed(() => {
  const items = data.value?.paymentMethods ?? []
  return {
    labels: items.map((p) => p.name),
    datasets: [
      {
        data: items.map((p) => p.amount),
        backgroundColor: WARM_PALETTE.slice(0, items.length),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  }
})

const bookingSourcesChartData = computed(() => {
  const items = data.value?.bookingSources ?? []
  return {
    labels: items.map((s) => t(`analytics.sources.${s.source}`) || s.source),
    datasets: [
      {
        data: items.map((s) => s.count),
        backgroundColor: WARM_PALETTE.slice(0, items.length),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  }
})

const maxServiceCount = computed(() =>
  Math.max(...(data.value?.topServices?.map((s) => s.count) ?? [1])),
)

function serviceBarWidth(count: number) {
  return Math.round((count / maxServiceCount.value) * 100)
}
</script>
