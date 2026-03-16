<template>
  <!-- Success overlay with checkmark animation -->
  <Transition name="fade">
    <div v-if="showSuccess" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--ui-bg)]">
      <svg class="checkmark" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
        <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
        <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
      </svg>
      <p class="mt-6 text-lg font-semibold">{{ $t('pages.booking.success') }}</p>
    </div>
  </Transition>

  <!-- Wizard UI -->
  <div class="flex flex-col min-h-screen">
    <!-- Sticky top: progress bar + step header -->
    <div class="sticky top-0 z-10 bg-[var(--ui-bg)]">
      <!-- Thin progress line -->
      <div class="h-1 bg-[var(--ui-border)]">
        <div
          class="h-1 bg-primary-500 transition-all duration-300"
          :style="{ width: `${(store.currentStep / 4) * 100}%` }"
        />
      </div>
      <!-- Header row: back button + step title -->
      <div class="flex items-center gap-2 px-4 py-3 border-b border-[var(--ui-border)]">
        <UButton
          v-if="store.currentStep > 1"
          variant="ghost"
          color="neutral"
          icon="i-heroicons-arrow-left"
          size="sm"
          :aria-label="$t('common.back')"
          @click="store.prevStep()"
        />
        <div class="flex-1">
          <p class="text-xs text-[var(--ui-text-muted)]">
            {{ $t('pages.booking.stepOf', { current: store.currentStep, total: 4 }) }}
          </p>
          <h2 class="text-base font-semibold leading-tight">{{ stepTitle }}</h2>
        </div>
      </div>
    </div>

    <!-- Scrollable step content -->
    <div class="flex-1 p-4 pb-28">
      <!-- Step 1: Service selection -->
      <div v-if="store.currentStep === 1" class="space-y-3">
        <div
          v-for="service in services"
          :key="service.id"
          class="cursor-pointer rounded-xl border-2 p-4 transition-colors"
          :class="
            store.selectedService?.id === service.id
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
              : 'border-[var(--ui-border)] hover:border-primary-300'
          "
          role="radio"
          :aria-checked="store.selectedService?.id === service.id"
          tabindex="0"
          @click="store.selectedService = service"
          @keydown.enter="store.selectedService = service"
          @keydown.space.prevent="store.selectedService = service"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <p class="font-semibold">{{ service.name }}</p>
              <p v-if="service.description" class="mt-0.5 text-sm text-[var(--ui-text-muted)] line-clamp-2">
                {{ service.description }}
              </p>
              <p class="mt-1 text-sm text-[var(--ui-text-muted)]">
                {{ service.duration_minutes }} {{ $t('pages.masterProfile.services.duration') }}
              </p>
            </div>
            <div class="flex-shrink-0 text-right">
              <p class="font-semibold text-primary-500">{{ service.price }} {{ $t('services.currency') }}</p>
            </div>
          </div>
        </div>
        <UEmpty
          v-if="!services.length"
          icon="i-heroicons-scissors"
          :title="$t('pages.masterProfile.services.empty')"
        />
      </div>

      <!-- Step 2: Date selection -->
      <div v-else-if="store.currentStep === 2" class="flex justify-center">
        <BookingCalendar
          :selected-date="store.selectedDate"
          :min-date="new Date()"
          @select="store.selectedDate = $event"
        />
      </div>

      <!-- Step 3: Time slot grid -->
      <div v-else-if="store.currentStep === 3">
        <div v-if="slotsLoading" class="grid grid-cols-3 gap-2">
          <USkeleton v-for="n in 9" :key="n" class="h-11 rounded-lg" />
        </div>
        <UEmpty
          v-else-if="!store.availableSlots.length"
          icon="i-heroicons-clock"
          :title="$t('pages.booking.noSlots')"
        />
        <div v-else class="grid grid-cols-3 gap-2">
          <button
            v-for="slot in store.availableSlots"
            :key="slot.start"
            class="min-h-[44px] rounded-lg border text-sm font-medium transition-colors"
            :class="
              slot.available
                ? store.selectedSlot === slot.start
                  ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400'
                  : 'border-[var(--ui-border)] hover:border-primary-300'
                : 'opacity-40 line-through pointer-events-none border-[var(--ui-border)] text-[var(--ui-text-muted)]'
            "
            :disabled="!slot.available"
            @click="slot.available && (store.selectedSlot = slot.start)"
          >
            {{ formatSlotTime(slot.start) }}
          </button>
        </div>
      </div>

      <!-- Step 4: Contact info + Confirmation -->
      <div v-else-if="store.currentStep === 4" class="space-y-4">
        <!-- Summary card -->
        <UCard class="rounded-2xl">
          <div class="p-5 space-y-4">
            <div class="flex items-center gap-3">
              <UAvatar :src="masterAvatar ?? undefined" :alt="masterName" size="md" />
              <p class="font-semibold">{{ masterName }}</p>
            </div>
            <div class="space-y-2 text-sm border-t border-[var(--ui-border)] pt-3">
              <div class="flex justify-between">
                <span class="text-[var(--ui-text-muted)]">{{ $t('pages.booking.serviceLabel') }}</span>
                <span class="font-medium">{{ store.selectedService?.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--ui-text-muted)]">{{ $t('pages.booking.dateLabel') }}</span>
                <span class="font-medium">{{ formattedDate }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--ui-text-muted)]">{{ $t('pages.booking.timeLabel') }}</span>
                <span class="font-medium">{{ store.selectedSlot ? formatSlotTime(store.selectedSlot) : '' }}</span>
              </div>
              <div class="flex justify-between border-t border-[var(--ui-border)] pt-2">
                <span class="text-[var(--ui-text-muted)]">{{ $t('pages.booking.totalLabel') }}</span>
                <span class="font-semibold text-primary-500">
                  {{ store.selectedService?.price }} {{ $t('services.currency') }}
                </span>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Contact form with phone lookup -->
        <UForm ref="confirmFormRef" :schema="confirmSchema" :state="confirmState" class="space-y-4" @submit="onSubmit">
          <UFormField :label="$t('pages.booking.phone')" name="phone" required>
            <div class="relative">
              <UInput
                v-model="confirmState.phone"
                type="tel"
                size="lg"
                class="w-full"
                :placeholder="$t('pages.booking.phonePlaceholder')"
                @blur="lookupClient"
              />
              <span
                v-if="lookupLoading"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted"
              >
                {{ $t('pages.booking.lookingUp') }}
              </span>
            </div>
          </UFormField>

          <div v-if="clientFound !== null" class="rounded-lg px-3 py-2 text-sm"
            :class="clientFound ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'"
          >
            <span v-if="clientFound">{{ $t('pages.booking.clientFound', { name: confirmState.name }) }}</span>
            <span v-else>{{ $t('pages.booking.clientNotFound') }}</span>
          </div>

          <UFormField :label="$t('pages.booking.name')" name="name" required>
            <UInput
              v-model="confirmState.name"
              size="lg"
              class="w-full"
              :placeholder="$t('pages.booking.namePlaceholder')"
              :disabled="clientFound === true"
            />
          </UFormField>
        </UForm>
      </div>
    </div>

    <!-- Sticky bottom CTA -->
    <div class="fixed bottom-0 left-0 right-0 z-10 p-4 bg-[var(--ui-bg)] border-t border-[var(--ui-border)]">
      <UButton
        v-if="store.currentStep < 4"
        color="primary"
        size="lg"
        class="w-full"
        :disabled="!canProceed"
        @click="handleNext"
      >
        {{ $t('common.next') }}
      </UButton>
      <UButton
        v-else
        color="primary"
        size="lg"
        class="w-full"
        :loading="submitting"
        :disabled="!canProceed"
        @click="triggerSubmit"
      >
        {{ $t('pages.booking.confirm') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { Service } from '~/types'

const props = defineProps<{
  masterId: string
  masterName: string
  masterAvatar: string | null
  services: Service[]
}>()

const emit = defineEmits<{
  success: []
}>()

const { t, locale } = useI18n()
const toast = useToast()
const store = useBookingStore()
const submitting = ref(false)
const slotsLoading = ref(false)
const showSuccess = ref(false)
const lookupLoading = ref(false)
const clientFound = ref<boolean | null>(null)
const confirmFormRef = useTemplateRef<{ submit: () => void }>('confirmFormRef')

const SUCCESS_ANIMATION_DURATION = 1800

const stepTitles = computed(() => [
  t('pages.booking.selectService'),
  t('pages.booking.selectDate'),
  t('pages.booking.selectTime'),
  t('pages.booking.confirm'),
])

const stepTitle = computed(() => stepTitles.value[store.currentStep - 1] ?? '')

const confirmState = reactive({
  name: '',
  phone: '',
})

const confirmSchema = z.object({
  name: z.string().min(1, t('pages.booking.validation.nameRequired')),
  phone: z
    .string()
    .min(1, t('pages.booking.validation.phoneRequired'))
    .regex(/^\+?[\d\s\-()]{7,}$/, t('pages.booking.validation.phoneInvalid')),
})

const canProceed = computed(() => {
  switch (store.currentStep) {
    case 1:
      return !!store.selectedService
    case 2:
      return !!store.selectedDate
    case 3:
      return !!store.selectedSlot
    case 4:
      return confirmState.name.trim().length > 0 && confirmState.phone.trim().length > 0
    default:
      return false
  }
})

async function lookupClient() {
  const phone = confirmState.phone.trim()
  if (!phone || phone.length < 7) return

  lookupLoading.value = true
  clientFound.value = null
  try {
    const result = await $fetch<{ found: boolean; name?: string }>(
      `/api/masters/${props.masterId}/lookup-client`,
      { method: 'POST', body: { phone } },
    )
    clientFound.value = result.found
    if (result.found && result.name) {
      confirmState.name = result.name
    }
  } catch {
    clientFound.value = false
  } finally {
    lookupLoading.value = false
  }
}

function formatSlotTime(iso: string): string {
  const d = new Date(iso)
  const h = String(d.getUTCHours()).padStart(2, '0')
  const m = String(d.getUTCMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

const formattedDate = computed(() => {
  if (!store.selectedDate) return ''
  return store.selectedDate.toLocaleDateString(locale.value, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

watch(
  () => store.currentStep,
  async (step) => {
    if (step === 3 && store.selectedDate && store.selectedService) {
      slotsLoading.value = true
      store.selectedSlot = null
      try {
        await store.fetchSlots(props.masterId, store.selectedDate, store.selectedService.id)
      } finally {
        slotsLoading.value = false
      }
    }
    // Reset lookup state when navigating to step 4
    if (step === 4) {
      clientFound.value = null
      confirmState.name = ''
      confirmState.phone = ''
    }
  },
)

watch(
  () => store.selectedDate,
  async (date) => {
    if (store.currentStep === 3 && date && store.selectedService) {
      slotsLoading.value = true
      store.selectedSlot = null
      try {
        await store.fetchSlots(props.masterId, date, store.selectedService.id)
      } finally {
        slotsLoading.value = false
      }
    }
  },
)

function handleNext() {
  if (!canProceed.value) return
  store.nextStep()
}

function triggerSubmit() {
  confirmFormRef.value?.submit()
}

async function onSubmit() {
  if (!store.selectedService || !store.selectedSlot) return
  submitting.value = true
  try {
    await store.createBooking({
      masterId: props.masterId,
      serviceId: store.selectedService.id,
      startsAt: store.selectedSlot,
      clientName: confirmState.name,
      clientPhone: confirmState.phone,
    })
    showSuccess.value = true
    await new Promise((resolve) => setTimeout(resolve, SUCCESS_ANIMATION_DURATION))
    emit('success')
  } catch {
    toast.add({ title: t('errors.general'), color: 'error' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.checkmark {
  width: 80px;
  height: 80px;
  stroke: var(--color-primary-500, #10b981);
  stroke-width: 2.5;
}

.checkmark__circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-miterlimit: 10;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark__check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
}

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
