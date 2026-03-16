<template>
  <div class="min-h-screen bg-(--ui-bg) flex flex-col items-center py-12 px-4">
    <!-- Logo -->
    <NuxtLink
      :to="localePath('/')"
      class="mb-10 font-serif text-2xl font-light text-highlighted hover:opacity-75 transition-opacity"
    >
      BeautyBook
    </NuxtLink>

    <!-- Progress bar -->
    <div class="w-full max-w-lg mb-8">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs text-muted">
          {{ t('pages.onboarding.stepOf', { current: step, total: TOTAL_STEPS }) }}
        </span>
        <span class="text-xs font-medium text-highlighted">{{ stepTitles[step - 1] }}</span>
      </div>
      <div class="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          class="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          :style="{ width: `${(step / TOTAL_STEPS) * 100}%` }"
        />
      </div>
    </div>

    <!-- Card -->
    <div class="w-full max-w-lg rounded-2xl border border-default bg-elevated p-8 shadow-sm">

      <!-- STEP 1: Business name + username -->
      <template v-if="step === 1">
        <h1 class="font-serif text-2xl font-light mb-1">{{ t('pages.onboarding.step1.title') }}</h1>
        <p class="text-sm text-muted mb-7">{{ t('pages.onboarding.step1.subtitle') }}</p>

        <div class="space-y-5">
          <UFormField :label="t('pages.onboarding.step1.nameLabel')" required>
            <UInput
              v-model="form.fullName"
              :placeholder="t('pages.onboarding.step1.namePlaceholder')"
              size="lg"
              class="w-full"
              @input="onNameInput"
            />
          </UFormField>

          <UFormField
            :label="t('pages.onboarding.step1.usernameLabel')"
            :hint="`beautybook.app/master/${form.username || 'your-name'}`"
            :error="usernameError || undefined"
            required
          >
            <UInput
              v-model="form.username"
              :placeholder="t('pages.onboarding.step1.usernamePlaceholder')"
              size="lg"
              class="w-full font-mono"
              @input="onUsernameInput"
            >
              <template #trailing>
                <UIcon
                  v-if="usernameChecking"
                  name="i-heroicons-arrow-path"
                  class="animate-spin size-4 text-muted"
                />
                <UIcon
                  v-else-if="usernameAvailable === true"
                  name="i-heroicons-check-circle"
                  class="size-4 text-success"
                />
                <UIcon
                  v-else-if="usernameAvailable === false"
                  name="i-heroicons-x-circle"
                  class="size-4 text-error"
                />
              </template>
            </UInput>
          </UFormField>
        </div>
      </template>

      <!-- STEP 2: Avatar / logo -->
      <template v-else-if="step === 2">
        <h1 class="font-serif text-2xl font-light mb-1">{{ t('pages.onboarding.step2.title') }}</h1>
        <p class="text-sm text-muted mb-7">{{ t('pages.onboarding.step2.subtitle') }}</p>

        <div class="flex flex-col items-center gap-6">
          <button
            type="button"
            class="relative size-36 rounded-full overflow-hidden border-2 border-dashed border-default bg-muted flex items-center justify-center hover:border-primary transition-colors"
            :class="{ 'border-primary border-solid': form.avatarUrl }"
            @click="triggerFileInput"
          >
            <img v-if="form.avatarUrl" :src="form.avatarUrl" class="size-full object-cover" alt="" />
            <div v-else class="flex flex-col items-center gap-2 text-muted pointer-events-none">
              <UIcon name="i-heroicons-camera" class="size-10" />
              <span class="text-xs">{{ t('common.upload') }}</span>
            </div>
            <div v-if="avatarUploading" class="absolute inset-0 bg-black/40 flex items-center justify-center">
              <UIcon name="i-heroicons-arrow-path" class="size-6 text-white animate-spin" />
            </div>
          </button>

          <input
            ref="fileInputRef"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            @change="handleAvatarUpload"
          />

          <UButton variant="outline" :loading="avatarUploading" @click="triggerFileInput">
            {{ form.avatarUrl ? t('profileEdit.changePhoto') : t('pages.onboarding.step2.uploadButton') }}
          </UButton>
        </div>
      </template>

      <!-- STEP 3: Specializations -->
      <template v-else-if="step === 3">
        <h1 class="font-serif text-2xl font-light mb-1">{{ t('pages.onboarding.step3.title') }}</h1>
        <p class="text-sm text-muted mb-7">{{ t('pages.onboarding.step3.subtitle') }}</p>

        <div class="flex flex-wrap gap-2.5">
          <button
            v-for="spec in SPECIALIZATIONS"
            :key="spec.value"
            type="button"
            class="px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150"
            :class="
              form.specializations.includes(spec.value)
                ? 'bg-primary border-primary text-white shadow-sm'
                : 'border-default text-default hover:border-primary hover:text-primary'
            "
            @click="toggleSpec(spec.value)"
          >
            {{ spec.label }}
          </button>
        </div>
      </template>

      <!-- STEP 4: Work schedule -->
      <template v-else-if="step === 4">
        <h1 class="font-serif text-2xl font-light mb-1">{{ t('pages.onboarding.step4.title') }}</h1>
        <p class="text-sm text-muted mb-7">{{ t('pages.onboarding.step4.subtitle') }}</p>

        <div class="space-y-2">
          <div v-for="day in DAYS" :key="day.key" class="flex items-center gap-3 py-1">
            <span class="w-7 shrink-0 text-center text-sm font-medium text-muted">
              {{ t(`profileEdit.days.${day.key}`) }}
            </span>
            <UToggle v-model="form.workHours[day.key].working" size="sm" />
            <template v-if="form.workHours[day.key].working">
              <select
                v-model="form.workHours[day.key].start"
                class="flex-1 rounded-lg border border-default bg-(--ui-bg) px-2 py-1.5 text-sm text-default focus:outline-none focus:border-primary"
              >
                <option v-for="slot in timeOptions" :key="slot" :value="slot">{{ slot }}</option>
              </select>
              <span class="shrink-0 text-xs text-muted">—</span>
              <select
                v-model="form.workHours[day.key].end"
                class="flex-1 rounded-lg border border-default bg-(--ui-bg) px-2 py-1.5 text-sm text-default focus:outline-none focus:border-primary"
              >
                <option v-for="slot in timeOptions" :key="slot" :value="slot">{{ slot }}</option>
              </select>
            </template>
            <span v-else class="text-xs text-muted">{{ t('pages.onboarding.step4.dayOff') }}</span>
          </div>
        </div>
      </template>

      <!-- STEP 5: Summary -->
      <template v-else-if="step === 5">
        <h1 class="font-serif text-2xl font-light mb-1">{{ t('pages.onboarding.step5.title') }}</h1>
        <p class="text-sm text-muted mb-7">{{ t('pages.onboarding.step5.subtitle') }}</p>

        <div class="space-y-5">
          <!-- Profile preview -->
          <div class="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-default">
            <UAvatar :src="form.avatarUrl ?? undefined" :alt="form.fullName" size="lg" />
            <div class="min-w-0">
              <p class="font-semibold truncate">{{ form.fullName }}</p>
              <p class="text-xs text-muted font-mono truncate">
                beautybook.app/master/{{ form.username }}
              </p>
            </div>
          </div>

          <!-- Specializations -->
          <div v-if="form.specializations.length">
            <p class="text-xs font-medium text-muted uppercase tracking-widest mb-2">
              {{ t('pages.onboarding.step5.specializations') }}
            </p>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="s in form.specializations"
                :key="s"
                class="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
              >
                {{ specLabel(s) }}
              </span>
            </div>
          </div>

          <!-- Work schedule -->
          <div>
            <p class="text-xs font-medium text-muted uppercase tracking-widest mb-2">
              {{ t('pages.onboarding.step5.workSchedule') }}
            </p>
            <div class="space-y-1">
              <div
                v-for="day in DAYS"
                :key="day.key"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-muted">{{ t(`profileEdit.days.${day.key}`) }}</span>
                <span v-if="form.workHours[day.key].working" class="font-mono text-xs text-highlighted">
                  {{ form.workHours[day.key].start }} — {{ form.workHours[day.key].end }}
                </span>
                <span v-else class="text-xs text-muted/60">{{ t('pages.onboarding.step4.dayOff') }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Navigation -->
      <div class="flex gap-3 mt-8">
        <UButton
          v-if="step > 1"
          variant="outline"
          color="neutral"
          size="lg"
          :disabled="loading"
          @click="prevStep"
        >
          {{ t('common.back') }}
        </UButton>

        <!-- Skip avatar -->
        <UButton
          v-if="step === 2 && !form.avatarUrl"
          variant="ghost"
          color="neutral"
          size="lg"
          @click="nextStep"
        >
          {{ t('pages.onboarding.step2.skip') }}
        </UButton>

        <UButton
          color="primary"
          size="lg"
          class="flex-1"
          :loading="loading"
          :disabled="!canProceed || loading"
          @click="step === TOTAL_STEPS ? handleSubmit() : nextStep()"
        >
          {{ step === TOTAL_STEPS ? t('pages.onboarding.step5.createBtn') : t('common.next') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth',
})

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const TOTAL_STEPS = 5
const step = ref(1)
const loading = ref(false)

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
  { key: 'mon' },
  { key: 'tue' },
  { key: 'wed' },
  { key: 'thu' },
  { key: 'fri' },
  { key: 'sat' },
  { key: 'sun' },
] as const

const SPECIALIZATIONS = computed(() => [
  { value: 'manicure', label: t('pages.catalog.categories.manicure') },
  { value: 'pedicure', label: t('pages.catalog.categories.pedicure') },
  { value: 'lashes', label: t('pages.catalog.categories.lashes') },
  { value: 'brows', label: t('pages.catalog.categories.brows') },
  { value: 'makeup', label: t('pages.catalog.categories.makeup') },
  { value: 'tattoo', label: t('pages.catalog.categories.tattoo') },
  { value: 'haircut', label: t('pages.catalog.categories.haircut') },
  { value: 'coloring', label: t('pages.catalog.categories.coloring') },
  { value: 'massage', label: t('pages.catalog.categories.massage') },
])

function specLabel(value: string): string {
  return SPECIALIZATIONS.value.find((s) => s.value === value)?.label ?? value
}

// Time slots: 06:00 → 23:00, every 30 min (35 options)
const timeOptions = Array.from({ length: 35 }, (_, i) => {
  const mins = 360 + i * 30
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, '0')
  const m = (mins % 60).toString().padStart(2, '0')
  return `${h}:${m}`
})

// ─── Form state ───────────────────────────────────────────────────────────────

interface WorkDay {
  working: boolean
  start: string
  end: string
}

const form = reactive({
  fullName: '',
  username: '',
  avatarUrl: null as string | null,
  specializations: [] as string[],
  workHours: {
    mon: { working: true, start: '09:00', end: '18:00' },
    tue: { working: true, start: '09:00', end: '18:00' },
    wed: { working: true, start: '09:00', end: '18:00' },
    thu: { working: true, start: '09:00', end: '18:00' },
    fri: { working: true, start: '09:00', end: '18:00' },
    sat: { working: true, start: '10:00', end: '16:00' },
    sun: { working: false, start: '10:00', end: '16:00' },
  } as Record<string, WorkDay>,
})

// Step titles for progress header
const stepTitles = computed(() => [
  t('pages.onboarding.step1.title'),
  t('pages.onboarding.step2.title'),
  t('pages.onboarding.step3.title'),
  t('pages.onboarding.step4.title'),
  t('pages.onboarding.step5.title'),
])

// ─── Username validation ───────────────────────────────────────────────────────

const usernameChecking = ref(false)
const usernameAvailable = ref<boolean | null>(null)
const usernameError = ref('')
let usernameTimer: ReturnType<typeof setTimeout> | null = null

function onNameInput() {
  // Auto-fill username only while it's empty or matches the auto-generated value
  if (!form.username) {
    form.username = form.fullName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_-]/g, '')
      .slice(0, 30)
    scheduleUsernameCheck()
  }
}

function onUsernameInput() {
  form.username = form.username.toLowerCase().replace(/[^a-z0-9_-]/g, '')
  usernameAvailable.value = null
  usernameError.value = ''
  scheduleUsernameCheck()
}

function scheduleUsernameCheck() {
  if (usernameTimer) clearTimeout(usernameTimer)
  if (form.username.length >= 3) {
    usernameTimer = setTimeout(checkUsername, 600)
  } else {
    usernameChecking.value = false
    usernameAvailable.value = null
  }
}

async function checkUsername() {
  if (form.username.length < 3) return
  usernameChecking.value = true
  try {
    await $fetch(`/api/masters/${form.username}`)
    // 200 → username is taken
    usernameAvailable.value = false
    usernameError.value = t('pages.onboarding.step1.validation.usernameTaken')
  } catch (e: unknown) {
    const status = (e as { status?: number }).status ?? (e as { statusCode?: number }).statusCode
    if (status === 404) {
      usernameAvailable.value = true
      usernameError.value = ''
    } else {
      usernameAvailable.value = null
    }
  } finally {
    usernameChecking.value = false
  }
}

// ─── Can proceed per step ─────────────────────────────────────────────────────

const canProceed = computed(() => {
  switch (step.value) {
    case 1:
      return (
        form.fullName.trim().length > 0 &&
        form.username.length >= 3 &&
        /^[a-z0-9_-]+$/.test(form.username) &&
        usernameAvailable.value === true &&
        !usernameChecking.value
      )
    case 2:
      return true // avatar is optional
    case 3:
      return form.specializations.length > 0
    case 4:
      return DAYS.some((d) => form.workHours[d.key].working)
    case 5:
      return true
    default:
      return false
  }
})

// ─── Navigation ───────────────────────────────────────────────────────────────

function nextStep() {
  if (step.value < TOTAL_STEPS) step.value++
}

function prevStep() {
  if (step.value > 1) step.value--
}

// ─── Specializations ──────────────────────────────────────────────────────────

function toggleSpec(value: string) {
  const idx = form.specializations.indexOf(value)
  if (idx === -1) {
    form.specializations.push(value)
  } else {
    form.specializations.splice(idx, 1)
  }
}

// ─── Avatar upload ────────────────────────────────────────────────────────────

const fileInputRef = ref<HTMLInputElement | null>(null)
const avatarUploading = ref(false)

function triggerFileInput() {
  fileInputRef.value?.click()
}

async function handleAvatarUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  avatarUploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const result = await $fetch<{ url: string }>('/api/me/avatar', {
      method: 'POST',
      body: fd,
    })
    form.avatarUrl = result.url
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    avatarUploading.value = false
    // reset input so same file can be re-selected
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

// ─── Final submit ─────────────────────────────────────────────────────────────

async function handleSubmit() {
  loading.value = true
  try {
    // Convert working flag → off flag for the API/DB
    const workHours: Record<string, { start: string; end: string; off: boolean }> = {}
    for (const day of DAYS) {
      workHours[day.key] = {
        start: form.workHours[day.key].start,
        end: form.workHours[day.key].end,
        off: !form.workHours[day.key].working,
      }
    }

    await $fetch('/api/me/onboarding', {
      method: 'POST',
      body: {
        full_name: form.fullName,
        username: form.username,
        avatar_url: form.avatarUrl,
        specializations: form.specializations,
        work_hours: workHours,
      },
    })

    await navigateTo(localePath('/dashboard'))
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>
