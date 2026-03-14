<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="$t('pages.settings.title')" icon="i-heroicons-cog-6-tooth" />
    </template>

    <div class="p-6">
      <div class="mx-auto max-w-2xl space-y-6">
        <!-- Payment methods section -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between px-4 pt-4">
              <h2 class="text-base font-semibold">
                {{ $t('pages.settings.paymentTypes') }}
              </h2>
              <UButton
                icon="i-heroicons-plus"
                color="primary"
                variant="ghost"
                size="sm"
                @click="openAddForm"
              >
                {{ $t('paymentTypes.add') }}
              </UButton>
            </div>
          </template>

          <!-- Loading state -->
          <div v-if="loading" class="divide-y divide-default">
            <div v-for="n in 3" :key="n" class="flex items-center gap-3 px-4 py-3">
              <USkeleton class="h-5 flex-1 rounded-md" />
              <USkeleton class="h-6 w-10 rounded-full" />
              <USkeleton class="size-8 rounded-md" />
              <USkeleton class="size-8 rounded-md" />
            </div>
          </div>

          <!-- Empty state -->
          <div v-else-if="!paymentTypes.length && !showAddForm" class="px-4 pb-4">
            <UEmpty
              icon="i-heroicons-credit-card"
              :title="$t('paymentTypes.emptyTitle')"
              :description="$t('paymentTypes.emptyDescription')"
            >
              <template #actions>
                <UButton
                  icon="i-heroicons-plus"
                  color="primary"
                  size="lg"
                  @click="openAddForm"
                >
                  {{ $t('paymentTypes.addFirst') }}
                </UButton>
              </template>
            </UEmpty>
          </div>

          <!-- Payment types list -->
          <div v-else class="divide-y divide-default">
            <div
              v-for="pt in paymentTypes"
              :key="pt.id"
              class="flex items-center gap-3 px-4 py-3 transition-colors"
              :class="{ 'opacity-50': !pt.is_active }"
            >
              <UIcon name="i-heroicons-credit-card" class="size-5 shrink-0 text-muted" />
              <span class="min-w-0 flex-1 truncate text-sm font-medium">{{ pt.name }}</span>
              <UBadge
                v-if="!pt.is_active"
                color="neutral"
                variant="subtle"
                size="xs"
              >
                {{ $t('paymentTypes.inactive') }}
              </UBadge>
              <UToggle
                :model-value="pt.is_active"
                size="sm"
                @update:model-value="toggleActive(pt)"
              />
              <UButton
                icon="i-heroicons-pencil-square"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="openEditForm(pt)"
              />
              <UButton
                icon="i-heroicons-trash"
                color="error"
                variant="ghost"
                size="sm"
                @click="openDeleteModal(pt)"
              />
            </div>
          </div>

          <!-- Add / Edit inline form -->
          <div v-if="showAddForm || editingId" class="border-t border-default px-4 py-4">
            <p class="mb-3 text-sm font-medium text-muted">
              {{ editingId ? $t('common.edit') : $t('paymentTypes.add') }}
            </p>

            <!-- Presets -->
            <div v-if="!editingId" class="mb-3 flex flex-wrap gap-2">
              <UButton
                v-for="preset in PRESETS"
                :key="preset"
                size="xs"
                color="neutral"
                variant="outline"
                @click="applyPreset(preset)"
              >
                {{ preset }}
              </UButton>
            </div>

            <UForm :schema="schema" :state="formState" class="flex items-start gap-2" @submit="submitForm">
              <UFormField name="name" class="flex-1">
                <UInput
                  v-model="formState.name"
                  :placeholder="$t('paymentTypes.namePlaceholder')"
                  class="w-full"
                  autofocus
                />
              </UFormField>
              <UButton type="submit" color="primary" :loading="formLoading">
                {{ $t('common.save') }}
              </UButton>
              <UButton color="neutral" variant="ghost" @click="closeForm">
                {{ $t('common.cancel') }}
              </UButton>
            </UForm>
          </div>
        </UCard>
      </div>
    </div>
  </UDashboardPanel>

  <!-- Delete confirmation modal -->
  <UModal v-model:open="deleteModalOpen" :title="$t('paymentTypes.deleteModal.title')">
    <template #body>
      <p class="text-muted">
        {{ $t('paymentTypes.deleteModal.message', { name: deletingPaymentType?.name }) }}
      </p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton color="neutral" variant="outline" @click="deleteModalOpen = false">
          {{ $t('common.cancel') }}
        </UButton>
        <UButton color="error" :loading="deleteLoading" @click="confirmDelete">
          {{ $t('paymentTypes.deleteModal.confirm') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { Database } from '~/types/database.types'

type PaymentType = Database['public']['Tables']['payment_types']['Row']

definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { t, tm } = useI18n()
const toast = useToast()

const PRESETS = computed(() => tm('paymentTypes.presetValues') as string[])

const paymentTypes = ref<PaymentType[]>([])
const loading = ref(true)

const showAddForm = ref(false)
const editingId = ref<string | null>(null)
const formLoading = ref(false)

const deleteModalOpen = ref(false)
const deletingPaymentType = ref<PaymentType | null>(null)
const deleteLoading = ref(false)

const formState = reactive({ name: '' })

const schema = computed(() => {
  const existingNames = paymentTypes.value
    .filter((pt) => pt.id !== editingId.value)
    .map((pt) => pt.name.toLowerCase())

  return z.object({
    name: z
      .string()
      .min(1, t('paymentTypes.validation.nameRequired'))
      .refine((val) => !existingNames.includes(val.toLowerCase()), { message: t('paymentTypes.validation.nameDuplicate') }),
  })
})

async function fetchPaymentTypes() {
  loading.value = true
  try {
    paymentTypes.value = await $fetch<PaymentType[]>('/api/master/payment-types')
  }
  catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  }
  finally {
    loading.value = false
  }
}

function openAddForm() {
  editingId.value = null
  formState.name = ''
  showAddForm.value = true
}

function openEditForm(pt: PaymentType) {
  showAddForm.value = false
  editingId.value = pt.id
  formState.name = pt.name
}

function closeForm() {
  showAddForm.value = false
  editingId.value = null
  formState.name = ''
}

function applyPreset(preset: string) {
  formState.name = preset
}

async function submitForm() {
  formLoading.value = true
  try {
    if (editingId.value) {
      const updated = await $fetch<PaymentType>(`/api/master/payment-types/${editingId.value}`, {
        method: 'PATCH',
        body: { name: formState.name },
      })
      const idx = paymentTypes.value.findIndex((pt) => pt.id === updated.id)
      if (idx >= 0) paymentTypes.value[idx] = updated
      toast.add({ title: t('paymentTypes.toast.updated'), color: 'success' })
    }
    else {
      const created = await $fetch<PaymentType>('/api/master/payment-types', {
        method: 'POST',
        body: { name: formState.name, sort_order: paymentTypes.value.length },
      })
      paymentTypes.value.push(created)
      toast.add({ title: t('paymentTypes.toast.created'), color: 'success' })
    }
    closeForm()
  }
  catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  }
  finally {
    formLoading.value = false
  }
}

async function toggleActive(pt: PaymentType) {
  try {
    const updated = await $fetch<PaymentType>(`/api/master/payment-types/${pt.id}`, {
      method: 'PATCH',
      body: { is_active: !pt.is_active },
    })
    const idx = paymentTypes.value.findIndex((p) => p.id === updated.id)
    if (idx >= 0) paymentTypes.value[idx] = updated
    toast.add({
      title: updated.is_active ? t('paymentTypes.toast.activated') : t('paymentTypes.toast.deactivated'),
      color: 'success',
    })
  }
  catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  }
}

function openDeleteModal(pt: PaymentType) {
  deletingPaymentType.value = pt
  deleteModalOpen.value = true
}

async function confirmDelete() {
  if (!deletingPaymentType.value) return
  deleteLoading.value = true
  try {
    await $fetch(`/api/master/payment-types/${deletingPaymentType.value.id}`, { method: 'DELETE' })
    paymentTypes.value = paymentTypes.value.filter((pt) => pt.id !== deletingPaymentType.value?.id)
    toast.add({ title: t('paymentTypes.toast.deleted'), color: 'success' })
    deleteModalOpen.value = false
  }
  catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  }
  finally {
    deleteLoading.value = false
  }
}

onMounted(() => fetchPaymentTypes())
</script>
