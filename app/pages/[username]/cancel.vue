<template>
  <div class="min-h-screen bg-default p-4 pt-6">
    <NuxtLink
      :to="localePath(`/${username}`)"
      class="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-highlighted"
    >
      <UIcon name="i-heroicons-arrow-left" class="size-4" />
      {{ $t('common.back') }}
    </NuxtLink>

    <h1 class="font-serif text-2xl font-light text-highlighted mt-4 mb-1">
      {{ $t('pages.cancelBooking.title') }}
    </h1>
    <p class="text-sm text-muted mb-6">{{ $t('pages.cancelBooking.subtitle') }}</p>

    <!-- Step 3: Success -->
    <div v-if="step === 'success'" class="rounded-2xl border border-default bg-elevated p-6 text-center">
      <UIcon name="i-heroicons-check-circle" class="mx-auto size-12 text-emerald-500 mb-3" />
      <h2 class="font-semibold text-highlighted mb-1">{{ $t('pages.cancelBooking.success') }}</h2>
      <p class="text-sm text-muted mb-4">{{ $t('pages.cancelBooking.successHint') }}</p>
      <div class="flex flex-col gap-2">
        <UButton color="neutral" variant="outline" @click="resetToPhone">
          {{ $t('pages.cancelBooking.cancelAnother') }}
        </UButton>
        <UButton color="neutral" variant="ghost" :to="localePath(`/${username}`)">
          {{ $t('pages.cancelBooking.backToProfile') }}
        </UButton>
      </div>
    </div>

    <!-- Step 1: Phone form -->
    <template v-else-if="step === 'phone'">
      <UForm :schema="phoneSchema" :state="phoneState" class="space-y-4" @submit="lookupBookings">
        <UFormField :label="$t('pages.cancelBooking.phone')" name="phone" required>
          <UInput
            v-model="phoneState.phone"
            type="tel"
            size="lg"
            class="w-full"
            :placeholder="$t('pages.cancelBooking.phonePlaceholder')"
          />
        </UFormField>

        <div
          v-if="errorMsg"
          class="rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-600 dark:text-red-400"
        >
          {{ errorMsg }}
        </div>

        <UButton type="submit" color="primary" size="lg" block :loading="loading">
          {{ $t('pages.cancelBooking.submit') }}
        </UButton>
      </UForm>
    </template>

    <!-- Step 2: Bookings list -->
    <template v-else-if="step === 'list'">
      <div class="space-y-3">
        <div
          v-for="booking in bookings"
          :key="booking.id"
          class="rounded-xl border border-default bg-elevated p-4 flex items-start justify-between gap-3"
        >
          <div class="flex-1 min-w-0">
            <p class="font-medium text-highlighted text-sm truncate">
              {{ getServiceName(booking) }}
            </p>
            <p class="text-sm text-muted mt-0.5">{{ formatBookingDate(booking.starts_at) }}</p>
            <UBadge
              :color="booking.status === 'confirmed' ? 'success' : 'warning'"
              variant="subtle"
              size="sm"
              class="mt-1.5"
            >
              {{ booking.status === 'confirmed' ? $t('status.confirmed') : $t('status.pending') }}
            </UBadge>
          </div>
          <UButton
            color="error"
            variant="soft"
            size="sm"
            @click="openConfirm(booking)"
          >
            {{ $t('pages.cancelBooking.cancelBtn') }}
          </UButton>
        </div>
      </div>

      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        class="mt-4"
        @click="resetToPhone"
      >
        <UIcon name="i-heroicons-arrow-left" class="size-4" />
        {{ $t('pages.cancelBooking.phone') }}
      </UButton>
    </template>

    <!-- Confirmation modal -->
    <UModal v-model:open="isConfirmOpen">
      <template #content>
        <div class="p-5 space-y-4">
          <div>
            <h3 class="font-semibold text-highlighted text-base">
              {{ $t('pages.cancelBooking.confirmTitle') }}
            </h3>
            <p class="text-sm text-muted mt-1">{{ $t('pages.cancelBooking.confirmMessage') }}</p>
          </div>

          <div v-if="selectedBooking" class="rounded-lg bg-accented px-3 py-2 text-sm">
            <p class="font-medium text-highlighted">{{ getServiceName(selectedBooking) }}</p>
            <p class="text-muted">{{ formatBookingDate(selectedBooking.starts_at) }}</p>
          </div>

          <UFormField :label="$t('pages.cancelBooking.reason')" name="reason">
            <UTextarea
              v-model="cancelReason"
              :placeholder="$t('pages.cancelBooking.reasonPlaceholder')"
              :rows="2"
              class="w-full"
            />
          </UFormField>

          <div
            v-if="cancelErrorMsg"
            class="rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-600 dark:text-red-400"
          >
            {{ cancelErrorMsg }}
          </div>

          <div class="flex gap-2 pt-1">
            <UButton
              color="error"
              class="flex-1"
              :loading="cancelLoading"
              @click="confirmCancel"
            >
              {{ $t('pages.cancelBooking.confirmBtn') }}
            </UButton>
            <UButton
              color="neutral"
              variant="outline"
              class="flex-1"
              :disabled="cancelLoading"
              @click="isConfirmOpen = false"
            >
              {{ $t('pages.cancelBooking.cancelConfirmClose') }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

const route = useRoute()
const username = route.params.username as string
const localePath = useLocalePath()
const { t, locale } = useI18n()

interface MasterData {
  id: string
}
const { data: master } = await useFetch<MasterData>(`/api/masters/${username}`)

interface BookingItem {
  id: string
  starts_at: string
  ends_at: string
  status: string
  services: { name: string } | null
}

type Step = 'phone' | 'list' | 'success'

const step = ref<Step>('phone')
const loading = ref(false)
const errorMsg = ref<string | null>(null)
const phoneState = reactive({ phone: '' })
const bookings = ref<BookingItem[]>([])

const isConfirmOpen = ref(false)
const selectedBooking = ref<BookingItem | null>(null)
const cancelReason = ref('')
const cancelLoading = ref(false)
const cancelErrorMsg = ref<string | null>(null)

const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, t('pages.cancelBooking.validation.phoneRequired'))
    .regex(/^\+?[\d\s\-()]{7,}$/, t('pages.booking.validation.phoneInvalid')),
})

async function lookupBookings() {
  if (!master.value) return
  loading.value = true
  errorMsg.value = null
  try {
    const result = await $fetch<{ bookings: BookingItem[] }>(
      `/api/masters/${master.value.id}/client-bookings`,
      { query: { phone: phoneState.phone } },
    )
    bookings.value = result.bookings
    step.value = 'list'
  } catch (err: unknown) {
    const e = err as { data?: { message?: string } }
    if (
      e?.data?.message === 'No bookings found for this phone number' ||
      e?.data?.message === 'No upcoming bookings found'
    ) {
      errorMsg.value = t('pages.cancelBooking.noBookings')
    } else {
      errorMsg.value = t('errors.general')
    }
  } finally {
    loading.value = false
  }
}

function openConfirm(booking: BookingItem) {
  selectedBooking.value = booking
  cancelReason.value = ''
  cancelErrorMsg.value = null
  isConfirmOpen.value = true
}

async function confirmCancel() {
  if (!master.value || !selectedBooking.value) return
  cancelLoading.value = true
  cancelErrorMsg.value = null
  try {
    await $fetch(`/api/masters/${master.value.id}/cancel`, {
      method: 'POST',
      body: {
        phone: phoneState.phone,
        bookingId: selectedBooking.value.id,
        reason: cancelReason.value || undefined,
      },
    })
    isConfirmOpen.value = false
    step.value = 'success'
  } catch {
    cancelErrorMsg.value = t('errors.general')
  } finally {
    cancelLoading.value = false
  }
}

function resetToPhone() {
  step.value = 'phone'
  bookings.value = []
  errorMsg.value = null
}

function getServiceName(booking: BookingItem): string {
  return booking.services?.name ?? '—'
}

function formatBookingDate(isoString: string): string {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat(locale.value === 'ky' ? 'ru' : locale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
</script>
