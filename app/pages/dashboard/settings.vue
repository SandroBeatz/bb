<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="$t('pages.settings.title')" icon="i-heroicons-cog-6-tooth" />
    </template>

    <div class="p-6">
      <div class="mx-auto max-w-2xl space-y-6">
        <!-- Profile section -->
        <UCard>
          <template #header>
            <div class="px-4 pt-4">
              <h2 class="text-base font-semibold">
                {{ $t('pages.settings.profileSection') }}
              </h2>
            </div>
          </template>

          <div v-if="profileLoading" class="space-y-4 px-4 py-4">
            <USkeleton class="h-16 w-16 rounded-full" />
            <USkeleton class="h-10 w-full rounded-md" />
            <USkeleton class="h-10 w-full rounded-md" />
            <USkeleton class="h-24 w-full rounded-md" />
          </div>

          <UForm
            v-else
            :schema="profileSchema"
            :state="profileState"
            class="divide-y divide-default"
            @submit="saveProfile"
          >
            <!-- Avatar -->
            <div class="flex items-center gap-4 px-4 py-6">
              <div class="relative shrink-0">
                <UAvatar
                  :src="profileState.avatar_url ?? undefined"
                  :alt="profileState.full_name"
                  size="xl"
                />
                <label
                  class="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity hover:opacity-100"
                  :title="$t('profileEdit.changePhoto')"
                >
                  <UIcon name="i-heroicons-camera" class="size-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    class="sr-only"
                    :disabled="avatarUploading"
                    @change="handleAvatarUpload"
                  >
                </label>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium">{{ $t('profileEdit.avatar') }}</p>
                <p class="mt-0.5 text-xs text-muted">{{ $t('profileEdit.changePhoto') }}</p>
                <USkeleton v-if="avatarUploading" class="mt-2 h-4 w-24 rounded" />
              </div>
            </div>

            <!-- Basic info -->
            <div class="space-y-4 px-4 py-6">
              <UFormField :label="$t('profileEdit.fullName')" name="full_name">
                <UInput
                  v-model="profileState.full_name"
                  :placeholder="$t('profileEdit.fullNamePlaceholder')"
                  size="lg"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="$t('profileEdit.username')" name="username">
                <UInput
                  v-model="profileState.username"
                  :placeholder="$t('profileEdit.usernamePlaceholder')"
                  size="lg"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="$t('profileEdit.bio')" name="bio">
                <UTextarea
                  v-model="profileState.bio"
                  :placeholder="$t('profileEdit.bioPlaceholder')"
                  size="lg"
                  :rows="3"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="$t('profileEdit.city')" name="city">
                <UInput
                  v-model="profileState.city"
                  :placeholder="$t('profileEdit.cityPlaceholder')"
                  size="lg"
                  class="w-full"
                />
              </UFormField>
            </div>

            <!-- Specializations -->
            <div class="px-4 py-6">
              <p class="mb-3 text-sm font-medium">{{ $t('profileEdit.specializations') }}</p>
              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="(spec, idx) in profileState.specializations"
                  :key="idx"
                  color="primary"
                  variant="subtle"
                  class="flex items-center gap-1"
                >
                  {{ spec }}
                  <button
                    type="button"
                    class="ml-1 hover:opacity-70"
                    @click="removeSpecialization(idx)"
                  >
                    <UIcon name="i-heroicons-x-mark" class="size-3" />
                  </button>
                </UBadge>
              </div>
              <div class="mt-3 flex gap-2">
                <UInput
                  v-model="newSpecialization"
                  :placeholder="$t('profileEdit.specializationsPlaceholder')"
                  size="sm"
                  class="flex-1"
                  @keydown.enter.prevent="addSpecialization"
                />
                <UButton
                  type="button"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  @click="addSpecialization"
                >
                  {{ $t('profileEdit.specializationAdd') }}
                </UButton>
              </div>
            </div>

            <!-- Contacts -->
            <div class="space-y-4 px-4 py-6">
              <p class="text-sm font-medium">{{ $t('profileEdit.contacts') }}</p>

              <UFormField :label="$t('profileEdit.telegram')" name="contacts.telegram">
                <UInput
                  v-model="profileState.contacts.telegram"
                  :placeholder="$t('profileEdit.telegramPlaceholder')"
                  size="lg"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="$t('profileEdit.whatsapp')" name="contacts.whatsapp">
                <UInput
                  v-model="profileState.contacts.whatsapp"
                  :placeholder="$t('profileEdit.whatsappPlaceholder')"
                  size="lg"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="$t('profileEdit.instagram')" name="contacts.instagram">
                <UInput
                  v-model="profileState.contacts.instagram"
                  :placeholder="$t('profileEdit.instagramPlaceholder')"
                  size="lg"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="$t('profileEdit.phone')" name="contacts.phone">
                <UInput
                  v-model="profileState.contacts.phone"
                  :placeholder="$t('profileEdit.phonePlaceholder')"
                  size="lg"
                  class="w-full"
                />
              </UFormField>
            </div>

            <!-- Work hours -->
            <div class="px-4 py-6">
              <p class="mb-4 text-sm font-medium">{{ $t('profileEdit.workHours') }}</p>
              <div class="space-y-3">
                <div
                  v-for="day in DAYS"
                  :key="day"
                  class="flex items-center gap-3"
                >
                  <span class="w-8 shrink-0 text-sm font-medium text-muted">
                    {{ $t(`profileEdit.days.${day}`) }}
                  </span>
                  <UToggle
                    :model-value="profileState.work_hours[day] !== null"
                    size="sm"
                    @update:model-value="toggleDay(day, $event)"
                  />
                  <template v-if="profileState.work_hours[day] !== null">
                    <UInput
                      v-model="profileState.work_hours[day]!.start"
                      type="time"
                      size="sm"
                      class="w-28"
                    />
                    <span class="text-muted">—</span>
                    <UInput
                      v-model="profileState.work_hours[day]!.end"
                      type="time"
                      size="sm"
                      class="w-28"
                    />
                  </template>
                  <span v-else class="text-sm text-muted">{{ $t('profileEdit.dayOff') }}</span>
                </div>
              </div>
            </div>

            <!-- Save button -->
            <div class="px-4 py-4">
              <UButton
                type="submit"
                color="primary"
                size="lg"
                :loading="profileSaving"
                class="w-full"
              >
                {{ $t('profileEdit.save') }}
              </UButton>
            </div>
          </UForm>
        </UCard>

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
const supabase = useSupabaseClient()

// ─── Profile ─────────────────────────────────────────────────────────────────

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
type Day = (typeof DAYS)[number]

interface WorkDay { start: string; end: string }

interface ProfileState {
  full_name: string
  username: string
  avatar_url: string | null
  bio: string
  city: string
  specializations: string[]
  contacts: { telegram: string; whatsapp: string; instagram: string; phone: string }
  work_hours: Record<Day, WorkDay | null>
}

const profileLoading = ref(true)
const profileSaving = ref(false)
const avatarUploading = ref(false)
const newSpecialization = ref('')

const defaultWorkHours = (): Record<Day, WorkDay | null> =>
  Object.fromEntries(DAYS.map((d) => [d, { start: '09:00', end: '18:00' }])) as Record<Day, WorkDay | null>

const profileState = reactive<ProfileState>({
  full_name: '',
  username: '',
  avatar_url: null,
  bio: '',
  city: '',
  specializations: [],
  contacts: { telegram: '', whatsapp: '', instagram: '', phone: '' },
  work_hours: defaultWorkHours(),
})

const profileSchema = z.object({
  full_name: z.string().min(1, t('profileEdit.validation.fullNameRequired')),
  username: z
    .string()
    .min(2, t('profileEdit.validation.usernameMinLength'))
    .regex(/^[a-z0-9_-]+$/, t('profileEdit.validation.usernameFormat'))
    .or(z.literal('')),
})

async function fetchProfile() {
  profileLoading.value = true
  try {
    const data = await $fetch<{
      full_name: string
      username: string | null
      avatar_url: string | null
      master_profiles: {
        bio: string | null
        city: string | null
        specializations: string[]
        contacts: Record<string, string>
        work_hours: Record<string, WorkDay | null>
      } | null
    }>('/api/master/profile')

    profileState.full_name = data.full_name ?? ''
    profileState.username = data.username ?? ''
    profileState.avatar_url = data.avatar_url ?? null

    const mp = data.master_profiles
    if (mp) {
      profileState.bio = mp.bio ?? ''
      profileState.city = mp.city ?? ''
      profileState.specializations = mp.specializations ?? []
      profileState.contacts = {
        telegram: (mp.contacts?.telegram as string) ?? '',
        whatsapp: (mp.contacts?.whatsapp as string) ?? '',
        instagram: (mp.contacts?.instagram as string) ?? '',
        phone: (mp.contacts?.phone as string) ?? '',
      }
      const wh = defaultWorkHours()
      for (const day of DAYS) {
        const val = mp.work_hours?.[day]
        wh[day] = val ?? null
      }
      Object.assign(profileState.work_hours, wh)
    }
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    profileLoading.value = false
  }
}

async function saveProfile() {
  profileSaving.value = true
  try {
    // Filter out empty contact strings
    const contacts: Record<string, string> = {}
    for (const [k, v] of Object.entries(profileState.contacts)) {
      if (v) contacts[k] = v
    }

    await $fetch('/api/master/profile', {
      method: 'PATCH',
      body: {
        full_name: profileState.full_name,
        username: profileState.username || undefined,
        avatar_url: profileState.avatar_url,
        bio: profileState.bio || null,
        city: profileState.city || null,
        specializations: profileState.specializations,
        contacts,
        work_hours: profileState.work_hours,
      },
    })
    toast.add({ title: t('profileEdit.toast.saved'), color: 'success' })
  } catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message
    if (message?.includes('already taken') || message?.includes('Username')) {
      toast.add({ title: t('profileEdit.validation.usernameTaken'), color: 'error' })
    } else {
      toast.add({ title: t('errors.general'), color: 'error' })
    }
  } finally {
    profileSaving.value = false
  }
}

async function handleAvatarUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // Validate MIME type
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.add({ title: t('errors.general'), color: 'error' })
    input.value = ''
    return
  }

  // Derive extension from MIME type for a safe filename
  const MIME_TO_EXT: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }
  const ext = MIME_TO_EXT[file.type] ?? 'jpg'

  avatarUploading.value = true
  try {
    // Resize to 256px using canvas
    const resized = await resizeImage(file, 256)
    const path = `avatars/${Date.now()}_${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, resized, { upsert: true, contentType: resized.type })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    profileState.avatar_url = urlData.publicUrl
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    avatarUploading.value = false
    input.value = ''
  }
}

function resizeImage(file: File, maxSize: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('canvas context unavailable'))
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('toBlob failed'))
      }, 'image/jpeg', 0.9)
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }
    img.src = url
  })
}

function addSpecialization() {
  const val = newSpecialization.value.trim()
  if (val && !profileState.specializations.includes(val)) {
    profileState.specializations.push(val)
  }
  newSpecialization.value = ''
}

function removeSpecialization(idx: number) {
  profileState.specializations.splice(idx, 1)
}

function toggleDay(day: Day, enabled: boolean) {
  profileState.work_hours[day] = enabled ? { start: '09:00', end: '18:00' } : null
}

// ─── Payment types ────────────────────────────────────────────────────────────

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
      .refine((val) => !existingNames.includes(val.toLowerCase()), {
        message: t('paymentTypes.validation.nameDuplicate'),
      }),
  })
})

async function fetchPaymentTypes() {
  loading.value = true
  try {
    paymentTypes.value = await $fetch<PaymentType[]>('/api/master/payment-types')
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
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
    } else {
      const created = await $fetch<PaymentType>('/api/master/payment-types', {
        method: 'POST',
        body: { name: formState.name, sort_order: paymentTypes.value.length },
      })
      paymentTypes.value.push(created)
      toast.add({ title: t('paymentTypes.toast.created'), color: 'success' })
    }
    closeForm()
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
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
      title: updated.is_active
        ? t('paymentTypes.toast.activated')
        : t('paymentTypes.toast.deactivated'),
      color: 'success',
    })
  } catch {
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
    await $fetch(`/api/master/payment-types/${deletingPaymentType.value.id}`, {
      method: 'DELETE',
    })
    paymentTypes.value = paymentTypes.value.filter((pt) => pt.id !== deletingPaymentType.value?.id)
    toast.add({ title: t('paymentTypes.toast.deleted'), color: 'success' })
    deleteModalOpen.value = false
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    deleteLoading.value = false
  }
}

onMounted(() => {
  fetchProfile()
  fetchPaymentTypes()
})
</script>
