<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="$t('nav.services')" icon="i-heroicons-scissors" />
    </template>

    <div class="p-6">
      <!-- Loading state -->
      <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="n in 3" :key="n" class="rounded-xl border border-default bg-default p-4">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1 space-y-2">
              <USkeleton class="h-5 w-2/3 rounded-md" />
              <USkeleton class="h-4 w-full rounded-md" />
              <USkeleton class="h-4 w-1/2 rounded-md" />
            </div>
            <USkeleton class="h-6 w-14 shrink-0 rounded-md" />
          </div>
          <div class="mt-4 flex justify-end gap-2 border-t border-default pt-4">
            <USkeleton class="size-8 rounded-md" />
            <USkeleton class="size-8 rounded-md" />
            <USkeleton class="size-8 rounded-md" />
          </div>
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

      <!-- Services grid -->
      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <UCard
          v-for="service in services"
          :key="service.id"
          class="rounded-xl"
          :class="{ 'opacity-50': !service.is_active }"
        >
          <div class="flex items-start justify-between gap-2 p-4">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <h3 class="truncate font-semibold">{{ service.name }}</h3>
                <UBadge
                  v-if="!service.is_active"
                  color="neutral"
                  variant="subtle"
                  size="xs"
                >
                  {{ $t('services.inactive') }}
                </UBadge>
              </div>
              <p v-if="service.description" class="mt-1 line-clamp-2 text-sm text-muted">
                {{ service.description }}
              </p>
              <div class="mt-2 flex items-center gap-1 text-sm text-muted">
                <UIcon name="i-heroicons-clock" class="size-4 shrink-0" />
                <span>{{ service.duration_minutes }} {{ $t('pages.masterProfile.services.duration') }}</span>
              </div>
            </div>
            <span class="shrink-0 text-lg font-semibold text-primary">
              {{ service.price }} {{ $t('services.currency') }}
            </span>
          </div>

          <template #footer>
            <div class="flex items-center justify-end gap-2 px-4 pb-4">
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
          </template>
        </UCard>

        <!-- Add service card -->
        <button
          class="group flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-default bg-transparent transition-colors hover:border-primary hover:bg-primary/5"
          @click="openCreateModal"
        >
          <div class="flex size-10 items-center justify-center rounded-full bg-elevated transition-colors group-hover:bg-primary/10">
            <UIcon name="i-heroicons-plus" class="size-5 text-muted transition-colors group-hover:text-primary" />
          </div>
          <span class="text-sm font-medium text-muted transition-colors group-hover:text-primary">
            {{ $t('services.add') }}
          </span>
        </button>
      </div>
    </div>
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

const services = ref<Service[]>([])
const loading = ref(true)

const formModalOpen = ref(false)
const editingService = ref<Service | null>(null)

const deleteModalOpen = ref(false)
const deletingService = ref<Service | null>(null)
const deleteLoading = ref(false)

async function fetchServices() {
  loading.value = true
  try {
    services.value = await $fetch<Service[]>('/api/master/services')
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    loading.value = false
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
    await $fetch(`/api/master/services/${deletingService.value.id}`, { method: 'DELETE' })
    services.value = services.value.filter((s) => s.id !== deletingService.value?.id)
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
