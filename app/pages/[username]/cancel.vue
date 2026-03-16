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

    <div v-if="cancelled" class="rounded-2xl border border-default bg-elevated p-6 text-center">
      <UIcon name="i-heroicons-check-circle" class="mx-auto size-12 text-emerald-500 mb-3" />
      <h2 class="font-semibold text-highlighted mb-1">{{ $t('pages.cancelBooking.success') }}</h2>
      <p class="text-sm text-muted mb-4">{{ $t('pages.cancelBooking.successHint') }}</p>
      <UButton color="neutral" variant="outline" :to="localePath(`/${username}`)">
        {{ $t('pages.cancelBooking.backToProfile') }}
      </UButton>
    </div>

    <template v-else>
      <UForm :schema="cancelSchema" :state="cancelState" class="space-y-4" @submit="onSubmit">
        <UFormField :label="$t('pages.cancelBooking.phone')" name="phone" required>
          <UInput
            v-model="cancelState.phone"
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

        <UButton type="submit" color="error" size="lg" block :loading="loading">
          {{ $t('pages.cancelBooking.submit') }}
        </UButton>
      </UForm>
    </template>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

const route = useRoute()
const username = route.params.username as string
const localePath = useLocalePath()
const { t } = useI18n()

interface MasterData { id: string }
const { data: master } = await useFetch<MasterData>(`/api/masters/${username}`)

const loading = ref(false)
const cancelled = ref(false)
const errorMsg = ref<string | null>(null)
const cancelState = reactive({ phone: '' })

const cancelSchema = z.object({
  phone: z
    .string()
    .min(1, t('pages.cancelBooking.validation.phoneRequired'))
    .regex(/^\+?[\d\s\-()]{7,}$/, t('pages.booking.validation.phoneInvalid')),
})

async function onSubmit() {
  if (!master.value) return
  loading.value = true
  errorMsg.value = null
  try {
    await $fetch(`/api/masters/${master.value.id}/cancel`, {
      method: 'POST',
      body: { phone: cancelState.phone },
    })
    cancelled.value = true
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
</script>
