<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :toggle="false" :title="$t('nav.services')" icon="i-heroicons-scissors" />
    </template>

    <template #body>
    <UContainer>
      <!-- Loading state -->
      <div v-if="loading" class="divide-y divide-default rounded-xl border border-default">
        <div v-for="n in 3" :key="n" class="flex items-center gap-4 px-4 py-3">
          <div class="min-w-0 flex-1 space-y-2">
            <USkeleton class="h-5 w-2/5 rounded-md" />
            <USkeleton class="h-4 w-1/3 rounded-md" />
          </div>
          <USkeleton class="h-5 w-16 shrink-0 rounded-md" />
          <USkeleton class="size-8 shrink-0 rounded-md" />
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!services.length" class="flex flex-col items-center justify-center py-16">
        <UEmpty
          icon="i-heroicons-scissors"
          :title="$t('services.emptyTitle')"
          :description="$t('services.emptyDescription')"
        >
          <template #actions>
            <UButton
              icon="i-heroicons-plus"
              color="primary"
              size="lg"
              @click="openCreateModal"
            >
              {{ $t('services.addFirst') }}
            </UButton>
          </template>
        </UEmpty>
      </div>

      <!-- Services list -->
      <div v-else class="space-y-2">
        <div class="divide-y divide-default rounded-xl border border-default">
          <div
            v-for="service in services"
            :key="service.id"
            class="flex items-center gap-4 px-4 py-3 transition-colors"
            :class="{ 'opacity-50': !service.is_active }"
          >
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="truncate font-medium">{{ service.name }}</span>
                <UBadge
                  v-if="!service.is_active"
                  color="neutral"
                  variant="subtle"
                  size="xs"
                >
                  {{ $t('services.inactive') }}
                </UBadge>
              </div>
              <div class="mt-0.5 flex items-center gap-1 text-sm text-muted">
                <UIcon name="i-heroicons-clock" class="size-3.5 shrink-0" />
                <span>{{ service.duration_minutes }} {{ $t('pages.masterProfile.services.duration') }}</span>
                <template v-if="service.description">
                  <span class="text-default">·</span>
                  <span class="truncate">{{ service.description }}</span>
                </template>
              </div>
            </div>
            <span class="shrink-0 font-semibold text-primary">
              {{ service.price }} {{ $t('services.currency') }}
            </span>
            <div class="flex shrink-0 items-center gap-1">
              <UButton
                icon="i-heroicons-pencil-square"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="openEditModal(service)"
              />
              <UButton
                :icon="service.is_active ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="toggleActive(service)"
              />
              <UButton
                icon="i-heroicons-trash"
                color="error"
                variant="ghost"
                size="sm"
                @click="openDeleteModal(service)"
              />
            </div>
          </div>
        </div>

        <!-- Add service button -->
        <UButton
          icon="i-heroicons-plus"
          color="neutral"
          variant="outline"
          class="w-full"
          @click="openCreateModal"
        >
          {{ $t('services.add') }}
        </UButton>
      </div>
    </UContainer>
    </template>
  </UDashboardPanel>

  <!-- Service form modal -->
  <ServiceFormModal
    v-model:open="formModalOpen"
    :service="editingService"
    @saved="onServiceSaved"
  />

  <!-- Delete confirmation modal -->
  <UModal v-model:open="deleteModalOpen" :title="$t('services.deleteModal.title')">
    <template #body>
      <p class="text-muted">
        {{ $t('services.deleteModal.message', { name: deletingService?.name }) }}
      </p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          color="neutral"
          variant="outline"
          @click="deleteModalOpen = false"
        >
          {{ $t('common.cancel') }}
        </UButton>
        <UButton
          color="error"
          :loading="deleteLoading"
          @click="confirmDelete"
        >
          {{ $t('services.deleteModal.confirm') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database.types'

type Service = Database['public']['Tables']['services']['Row']

definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { t } = useI18n()
const toast = useToast()

const cache = useDashboardCache()
const { services, servicesLoading, servicesReady } = storeToRefs(cache)

const loading = computed(
  () => !servicesReady.value || (servicesLoading.value && !services.value.length),
)

const formModalOpen = ref(false)
const editingService = ref<Service | null>(null)

const deleteModalOpen = ref(false)
const deletingService = ref<Service | null>(null)
const deleteLoading = ref(false)

async function fetchServices() {
  try {
    await cache.fetchServices()
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  }
}

function openCreateModal() {
  editingService.value = null
  formModalOpen.value = true
}

function openEditModal(service: Service) {
  editingService.value = service
  formModalOpen.value = true
}

function onServiceSaved(saved: Service) {
  const idx = services.value.findIndex((s) => s.id === saved.id)
  if (idx >= 0) {
    services.value[idx] = saved
    toast.add({ title: t('services.toast.updated'), color: 'success' })
  } else {
    services.value.push(saved)
    toast.add({ title: t('services.toast.created'), color: 'success' })
  }
}

async function toggleActive(service: Service) {
  try {
    const updated = await $fetch<Service>(`/api/master/services/${service.id}`, {
      method: 'PATCH',
      body: { is_active: !service.is_active },
    })
    const idx = services.value.findIndex((s) => s.id === updated.id)
    if (idx >= 0) services.value[idx] = updated
    toast.add({
      title: updated.is_active ? t('services.toast.activated') : t('services.toast.deactivated'),
      color: 'success',
    })
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  }
}

function openDeleteModal(service: Service) {
  deletingService.value = service
  deleteModalOpen.value = true
}

async function confirmDelete() {
  if (!deletingService.value) return
  deleteLoading.value = true
  try {
    await $fetch(`/api/master/services/${deletingService.value.id}`, {
      method: 'DELETE',
    })
    const idx = services.value.findIndex((s) => s.id === deletingService.value?.id)
    if (idx >= 0) services.value.splice(idx, 1)
    toast.add({ title: t('services.toast.deleted'), color: 'success' })
    deleteModalOpen.value = false
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    deleteLoading.value = false
  }
}

onMounted(() => fetchServices())
</script>
