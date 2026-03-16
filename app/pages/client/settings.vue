<template>
  <UContainer class="py-6 max-w-lg">
    <h1 class="text-2xl font-bold mb-6">{{ $t('pages.client.settingsPage.title') }}</h1>

    <UCard>
      <template #header>
        <div class="px-4 pt-4">
          <h2 class="text-base font-semibold">{{ $t('pages.client.settingsPage.profileSection') }}</h2>
        </div>
      </template>

      <div v-if="loading" class="divide-y divide-default">
        <div class="flex items-center gap-4 px-4 py-6">
          <USkeleton class="size-16 rounded-full shrink-0" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-24 rounded-md" />
          </div>
        </div>
        <div class="space-y-4 px-4 py-6">
          <USkeleton class="h-10 w-full rounded-md" />
          <USkeleton class="h-10 w-full rounded-md" />
          <USkeleton class="h-10 w-full rounded-md" />
        </div>
      </div>

      <UForm
        v-else
        :schema="schema"
        :state="formState"
        class="divide-y divide-default"
        @submit="handleSave"
      >
        <!-- Avatar -->
        <div class="flex items-center gap-4 px-4 py-6">
          <div class="relative shrink-0">
            <UAvatar
              :src="formState.avatar_url ?? undefined"
              :alt="formState.full_name"
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

        <!-- Fields -->
        <div class="space-y-4 px-4 py-6">
          <UFormField :label="$t('profileEdit.fullName')" name="full_name">
            <UInput
              v-model="formState.full_name"
              :placeholder="$t('profileEdit.fullNamePlaceholder')"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="$t('pages.client.settingsPage.phone')" name="phone">
            <UInput
              v-model="formState.phone"
              :placeholder="$t('pages.client.settingsPage.phonePlaceholder')"
              type="tel"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="$t('pages.client.settingsPage.email')" name="email">
            <UInput
              v-model="formState.email"
              :placeholder="$t('pages.client.settingsPage.emailPlaceholder')"
              type="email"
              size="lg"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Save button -->
        <div class="px-4 py-4">
          <UButton
            type="submit"
            color="primary"
            size="lg"
            :loading="saving"
            class="w-full"
          >
            {{ $t('common.save') }}
          </UButton>
        </div>
      </UForm>
    </UCard>

    <!-- Sign out (mobile only) -->
    <UButton
      class="md:hidden w-full mt-4"
      color="neutral"
      variant="outline"
      icon="i-heroicons-arrow-right-on-rectangle"
      @click="handleSignOut"
    >
      {{ $t('nav.signOut') }}
    </UButton>
  </UContainer>
</template>

<script setup lang="ts">
import { z } from 'zod'

definePageMeta({ middleware: 'client-only' })

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const clerk = useClerk()
const { profile, fetch, update } = useProfile()

const loading = ref(true)
const saving = ref(false)
const avatarUploading = ref(false)

const schema = computed(() =>
  z.object({
    full_name: z.string().min(1, t('profileEdit.validation.fullNameRequired')),
    phone: z.string().optional().or(z.literal('')),
    email: z.string().email().optional().or(z.literal('')),
  }),
)

const formState = reactive({
  full_name: '',
  phone: '',
  email: '',
  avatar_url: null as string | null,
})

watch(
  profile,
  (p) => {
    if (!p) return
    formState.full_name = p.full_name ?? ''
    formState.phone = p.phone ?? ''
    formState.email = p.email ?? ''
    formState.avatar_url = p.avatar_url
    loading.value = false
  },
  { immediate: true },
)

onMounted(async () => {
  if (!profile.value) {
    await fetch()
  }
  loading.value = false
})

async function handleSave() {
  saving.value = true
  try {
    await update({
      full_name: formState.full_name,
      phone: formState.phone || null,
      email: formState.email || null,
      avatar_url: formState.avatar_url,
    })
    toast.add({ title: t('pages.client.settingsPage.saved'), color: 'success' })
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    saving.value = false
  }
}

async function handleAvatarUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.add({ title: t('errors.general'), color: 'error' })
    input.value = ''
    return
  }

  avatarUploading.value = true
  try {
    const resized = await resizeImage(file, 256)
    const fd = new FormData()
    fd.append('file', new File([resized], 'avatar', { type: resized.type }))

    const { url } = await $fetch<{ url: string }>('/api/me/avatar', {
      method: 'POST',
      body: fd,
    })
    formState.avatar_url = url
    await update({ avatar_url: url })
    toast.add({ title: t('profileEdit.avatar'), color: 'success' })
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
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('toBlob failed'))
        },
        'image/jpeg',
        0.9,
      )
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }
    img.src = url
  })
}

async function handleSignOut() {
  await clerk.value?.signOut()
  await navigateTo(localePath('/'))
}
</script>
