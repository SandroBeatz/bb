<template>
  <div ref="rootRef" class="relative">
    <!-- Selected client -->
    <div
      v-if="selectedClient"
      class="flex items-center gap-2 px-3 py-2 rounded-lg border border-default bg-elevated"
    >
      <UIcon name="i-heroicons-user-circle" class="size-4 shrink-0 text-muted" />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium leading-none">{{ selectedClient.name }}</p>
        <p class="text-xs text-muted mt-0.5">{{ selectedClient.phone }}</p>
      </div>
      <UButton
        icon="i-heroicons-x-mark"
        size="xs"
        variant="ghost"
        color="neutral"
        @click="clear"
      />
    </div>

    <!-- Search input -->
    <template v-else>
      <UInput
        v-model="query"
        :placeholder="$t('calendar.clientPicker.placeholder')"
        icon="i-heroicons-magnifying-glass"
        :loading="loadingClients"
        class="w-full"
        @focus="open = true"
        @keydown.escape="open = false"
      />

      <!-- Dropdown -->
      <div
        v-if="open"
        class="absolute z-50 top-full left-0 right-0 mt-1 bg-default border border-default rounded-lg shadow-lg max-h-56 overflow-y-auto"
      >
        <!-- Results -->
        <template v-if="filtered.length">
          <button
            v-for="client in filtered"
            :key="client.id"
            type="button"
            class="w-full flex items-center gap-2 px-3 py-2 hover:bg-elevated text-left transition-colors"
            @mousedown.prevent="select(client)"
          >
            <UIcon name="i-heroicons-user-circle" class="size-4 shrink-0 text-muted" />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium truncate">{{ client.name }}</p>
              <p class="text-xs text-muted">
                <span v-if="client.phone">{{ client.phone }} · </span>{{ client.visit_count }} {{ $t('calendar.clientPicker.visits') }}
              </p>
            </div>
          </button>
        </template>
        <div v-else-if="!query.trim() && !loadingClients" class="px-3 py-6 text-center text-sm text-muted">
          {{ $t('calendar.clientPicker.empty') }}
        </div>
        <div v-else-if="query.trim() && !loadingClients" class="px-3 py-2 text-sm text-muted text-center">
          {{ $t('calendar.clientPicker.notFound') }}
        </div>

        <!-- Create new -->
        <div v-if="query.trim()" class="border-t border-default">
          <button
            type="button"
            class="w-full flex items-center gap-2 px-3 py-2 hover:bg-elevated text-left transition-colors"
            @mousedown.prevent="startCreate"
          >
            <UIcon name="i-heroicons-plus-circle" class="size-4 shrink-0 text-primary" />
            <span class="text-sm text-primary">
              {{ $t('calendar.clientPicker.createNew', { name: query.trim() }) }}
            </span>
          </button>
        </div>
      </div>
    </template>

    <!-- Inline create form -->
    <div v-if="creating" class="mt-2 p-3 border border-default rounded-lg space-y-2 bg-elevated">
      <p class="text-xs font-medium text-muted uppercase tracking-wide">
        {{ $t('calendar.clientPicker.newClientTitle') }}
      </p>
      <UInput
        v-model="newName"
        :placeholder="$t('calendar.clientPicker.namePlaceholder')"
        size="sm"
        class="w-full"
      />
      <UInput
        v-model="newPhone"
        :placeholder="$t('calendar.clientPicker.phonePlaceholder')"
        size="sm"
        class="w-full"
      />
      <div class="flex gap-2">
        <UButton size="xs" color="primary" :loading="saving" :disabled="!newName.trim()" @click="createClient">
          {{ $t('common.add') }}
        </UButton>
        <UButton size="xs" variant="ghost" color="neutral" @click="creating = false">
          {{ $t('common.cancel') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Client {
  id: string
  name: string
  phone: string
  notes: string | null
  visit_count: number
  last_visit: string | null
  total_amount: number
}

const emit = defineEmits<{
  'update:clientId': [id: string | null]
}>()

const { t } = useI18n()
const toast = useToast()

const rootRef = ref<HTMLElement | null>(null)
const query = ref('')
const open = ref(false)
const loadingClients = ref(false)
const clients = ref<Client[]>([])
const selectedClient = ref<Client | null>(null)

// Create new client state
const creating = ref(false)
const saving = ref(false)
const newName = ref('')
const newPhone = ref('')

const filtered = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return clients.value.slice(0, 10)
  return clients.value.filter(
    (c) => c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q),
  )
})

onMounted(async () => {
  await loadClients()
})

// Close dropdown on outside click
onMounted(() => {
  document.addEventListener('mousedown', onOutsideClick)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onOutsideClick)
})

function onOutsideClick(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

async function loadClients() {
  loadingClients.value = true
  try {
    clients.value = await $fetch<Client[]>('/api/master/clients')
  } catch {
    // silently fail, user can still create new clients
  } finally {
    loadingClients.value = false
  }
}

function select(client: Client) {
  selectedClient.value = client
  open.value = false
  query.value = ''
  creating.value = false
  emit('update:clientId', client.id)
}

function clear() {
  selectedClient.value = null
  query.value = ''
  emit('update:clientId', null)
}

function startCreate() {
  newName.value = query.value.trim()
  newPhone.value = ''
  creating.value = true
  open.value = false
}

async function createClient() {
  if (!newName.value.trim()) return
  saving.value = true
  try {
    const client = await $fetch<Client>('/api/master/clients', {
      method: 'POST',
      body: { name: newName.value.trim(), phone: newPhone.value.trim() },
    })
    clients.value.unshift(client)
    select(client)
    creating.value = false
    toast.add({ title: t('calendar.clientPicker.created'), color: 'success' })
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>
