<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :toggle="false" :title="$t('nav.clients')" icon="i-heroicons-users">
        <template #right>
          <UButton
            icon="i-heroicons-plus"
            size="sm"
            color="primary"
            variant="soft"
            @click="addClientOpen = true"
          >
            {{ $t('clients.addClient') }}
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UContainer class="space-y-4">
        <!-- Search -->
        <UInput
          v-model="search"
          :placeholder="$t('clients.searchPlaceholder')"
          icon="i-heroicons-magnifying-glass"
          class="sticky top-0 z-10"
        />

        <!-- Loading -->
        <div v-if="loading" class="space-y-3">
          <USkeleton v-for="i in 5" :key="i" class="h-16 rounded-xl" />
        </div>

        <!-- Empty state -->
        <UEmpty
          v-else-if="filteredClients.length === 0"
          icon="i-heroicons-users"
          :title="$t('clients.emptyTitle')"
          :description="$t('clients.emptyDescription')"
        />

        <!-- Client list -->
        <div v-else class="space-y-2">
          <div
            v-for="client in filteredClients"
            :key="client.id"
            class="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-muted transition-colors"
            @click="openClient(client)"
          >
            <UAvatar :alt="client.name" size="sm" />
            <div class="flex-1 min-w-0">
              <p class="font-medium truncate">{{ client.name }}</p>
              <p class="text-sm text-muted truncate">
                {{ client.phone }}
                <span v-if="client.visit_count > 0"> · {{ $t('clients.visits', { count: client.visit_count }) }}</span>
                <span v-if="client.last_visit"> · {{ formatDate(client.last_visit) }}</span>
              </p>
            </div>
            <div v-if="client.total_amount > 0" class="text-right shrink-0">
              <p class="text-sm font-medium">{{ client.total_amount }} {{ $t('services.currency') }}</p>
            </div>
          </div>
        </div>

        <!-- Client detail slideover -->
        <USlideover v-model:open="slideoverOpen" side="right">
          <template #content>
            <div v-if="selectedClient" class="flex flex-col h-full">
              <!-- Header -->
              <div class="flex items-center gap-3 p-4 border-b">
                <UAvatar :alt="selectedClient.name" size="md" />
                <div class="flex-1 min-w-0">
                  <p class="font-semibold truncate">{{ selectedClient.name }}</p>
                  <p class="text-sm text-muted">{{ selectedClient.phone }}</p>
                  <p v-if="selectedClient.visit_count > 0" class="text-sm text-muted">
                    {{ $t('clients.visits', { count: selectedClient.visit_count }) }}
                  </p>
                </div>
                <UButton
                  variant="ghost"
                  color="neutral"
                  icon="i-heroicons-x-mark"
                  @click="slideoverOpen = false"
                />
              </div>

              <!-- Stats -->
              <div v-if="selectedClient.visit_count > 0" class="grid grid-cols-3 gap-3 p-4 border-b">
                <div class="text-center">
                  <p class="text-lg font-semibold">{{ selectedClient.visit_count }}</p>
                  <p class="text-xs text-muted">{{ $t('clients.visitsLabel') }}</p>
                </div>
                <div class="text-center">
                  <p class="text-lg font-semibold">{{ avgCheck }} {{ $t('services.currency') }}</p>
                  <p class="text-xs text-muted">{{ $t('clients.avgCheck') }}</p>
                </div>
                <div class="text-center">
                  <p class="text-lg font-semibold">{{ selectedClient.total_amount }} {{ $t('services.currency') }}</p>
                  <p class="text-xs text-muted">{{ $t('clients.totalAmount') }}</p>
                </div>
              </div>

              <!-- Notes -->
              <div v-if="selectedClient.notes" class="px-4 py-3 border-b">
                <p class="text-xs text-muted mb-1">{{ $t('clients.notes') }}</p>
                <p class="text-sm">{{ selectedClient.notes }}</p>
              </div>

              <!-- Preferred services -->
              <div v-if="preferredServices.length > 0" class="px-4 py-3 border-b">
                <p class="text-xs text-muted mb-2">{{ $t('clients.preferredServices') }}</p>
                <div class="flex flex-wrap gap-1">
                  <UBadge
                    v-for="svc in preferredServices"
                    :key="svc"
                    variant="soft"
                    color="primary"
                    size="sm"
                  >
                    {{ svc }}
                  </UBadge>
                </div>
              </div>

              <!-- Booking history -->
              <div class="flex-1 overflow-y-auto">
                <p class="px-4 pt-4 pb-2 text-sm font-semibold">{{ $t('clients.historyTitle') }}</p>

                <div v-if="detailLoading" class="px-4 space-y-3">
                  <USkeleton v-for="i in 3" :key="i" class="h-14 rounded-xl" />
                </div>

                <div v-else-if="clientBookings.length === 0" class="px-4">
                  <UEmpty icon="i-heroicons-calendar-days" :title="$t('bookings.empty')" description="" />
                </div>

                <div v-else class="px-4 pb-4 space-y-2">
                  <div
                    v-for="booking in clientBookings"
                    :key="booking.id"
                    class="p-3 rounded-xl border"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <div>
                        <p class="text-sm font-medium">
                          {{ (booking.services as { name: string } | null)?.name ?? '—' }}
                        </p>
                        <p class="text-xs text-muted mt-0.5">{{ formatDateTime(booking.starts_at) }}</p>
                      </div>
                      <UBadge :color="statusColor(booking.status)" variant="soft" size="sm">
                        {{ $t(`status.${booking.status}`) }}
                      </UBadge>
                    </div>
                    <div v-if="bookingAmount(booking) > 0" class="mt-1 text-xs text-muted">
                      {{ bookingAmount(booking) }} {{ $t('services.currency') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </USlideover>

        <!-- Add client modal -->
        <UModal v-model:open="addClientOpen" :title="$t('clients.addClient')">
          <template #body>
            <div class="p-4 space-y-4">
              <UFormField :label="$t('clients.form.name')" required>
                <UInput
                  v-model="newClientForm.name"
                  :placeholder="$t('clients.form.namePlaceholder')"
                  class="w-full"
                />
              </UFormField>
              <UFormField :label="$t('clients.form.phone')" required>
                <UInput
                  v-model="newClientForm.phone"
                  :placeholder="$t('clients.form.phonePlaceholder')"
                  class="w-full"
                />
              </UFormField>
              <UFormField :label="$t('clients.notes')">
                <UTextarea
                  v-model="newClientForm.notes"
                  :placeholder="$t('clients.notesPlaceholder')"
                  :rows="2"
                  class="w-full"
                />
              </UFormField>
              <div class="flex justify-end gap-2 pt-1">
                <UButton variant="ghost" color="neutral" @click="addClientOpen = false">
                  {{ $t('common.cancel') }}
                </UButton>
                <UButton
                  color="primary"
                  :loading="addClientLoading"
                  :disabled="!newClientForm.name.trim() || !newClientForm.phone.trim()"
                  icon="i-heroicons-user-plus"
                  @click="createClient"
                >
                  {{ $t('common.add') }}
                </UButton>
              </div>
            </div>
          </template>
        </UModal>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

type ClientItem = {
  id: string
  name: string
  phone: string
  notes: string | null
  created_at: string
  visit_count: number
  last_visit: string | null
  total_amount: number
}

type ClientBooking = {
  id: string
  starts_at: string
  ends_at: string
  status: string
  notes: string | null
  services: { id: string; name: string; price: number; duration_minutes: number } | null
  payment_records: { amount: number }[]
}

const { t, locale } = useI18n()
const toast = useToast()

const cache = useDashboardCache()
const { clients, clientsLoading, clientsReady } = storeToRefs(cache)

const search = ref('')
const loading = computed(
  () => !clientsReady.value || (clientsLoading.value && !clients.value.length),
)

const slideoverOpen = ref(false)
const selectedClient = ref<ClientItem | null>(null)
const detailLoading = ref(false)
const clientBookings = ref<ClientBooking[]>([])

const filteredClients = computed(() => {
  if (!search.value.trim()) return clients.value as ClientItem[]
  const q = search.value.toLowerCase()
  return (clients.value as ClientItem[]).filter(
    (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
  )
})

// Add client
const addClientOpen = ref(false)
const addClientLoading = ref(false)
const newClientForm = reactive({ name: '', phone: '', notes: '' })

async function createClient() {
  if (!newClientForm.name.trim() || !newClientForm.phone.trim()) return
  addClientLoading.value = true
  try {
    const client = await $fetch<ClientItem>('/api/master/clients', {
      method: 'POST',
      body: {
        name: newClientForm.name.trim(),
        phone: newClientForm.phone.trim(),
        notes: newClientForm.notes.trim() || undefined,
      },
    })
    ;(cache.clients as ClientItem[]).unshift(client)
    addClientOpen.value = false
    newClientForm.name = ''
    newClientForm.phone = ''
    newClientForm.notes = ''
    toast.add({ title: t('clients.added'), color: 'success' })
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    addClientLoading.value = false
  }
}

const avgCheck = computed(() => {
  if (!selectedClient.value || selectedClient.value.visit_count === 0) return 0
  return Math.round(selectedClient.value.total_amount / selectedClient.value.visit_count)
})

const preferredServices = computed(() => {
  const counts = new Map<string, number>()
  for (const b of clientBookings.value) {
    const name = (b.services as { name: string } | null)?.name
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name)
})

function bookingAmount(booking: ClientBooking): number {
  return booking.payment_records.reduce((sum, p) => sum + Number(p.amount), 0)
}

function statusColor(status: string) {
  const map: Record<string, 'warning' | 'success' | 'error' | 'neutral'> = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'success',
    cancelled: 'error',
  }
  return map[status] ?? 'neutral'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(locale.value, { day: 'numeric', month: 'short' })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(locale.value, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function openClient(client: ClientItem) {
  selectedClient.value = client
  slideoverOpen.value = true
  detailLoading.value = true
  clientBookings.value = []
  try {
    const data = await $fetch<{ client: ClientItem; bookings: ClientBooking[] }>(
      `/api/master/clients/${client.id}`,
    )
    clientBookings.value = data.bookings
  } catch {
    // ignore
  } finally {
    detailLoading.value = false
  }
}

onMounted(() => {
  cache.fetchClients()
})
</script>
