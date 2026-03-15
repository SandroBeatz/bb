<template>
  <UContainer v-if="pending" style="--ui-container: 32rem" class="space-y-4 py-8">
    <USkeleton class="h-6 w-48 rounded-lg" />
    <USkeleton class="h-32 rounded-xl" />
    <USkeleton class="h-32 rounded-xl" />
    <USkeleton class="h-32 rounded-xl" />
  </UContainer>
  <div v-else-if="!master" class="flex min-h-[60vh] items-center justify-center p-8">
    <UEmpty icon="i-heroicons-exclamation-circle" :title="$t('errors.notFound')" />
  </div>
  <BookingForm
    v-else
    :master-id="master.id"
    :master-name="master.full_name"
    :master-avatar="master.avatar_url"
    :services="services ?? []"
    @success="onSuccess"
  />
</template>

<script setup lang="ts">
import type { Service } from '~/types'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const username = route.params.username as string
const localePath = useLocalePath()
const { t } = useI18n()
const toast = useToast()
const store = useBookingStore()

interface MasterData {
  id: string
  full_name: string
  username: string
  avatar_url: string | null
}

const { data: master, pending: masterPending } = await useFetch<MasterData>(
  `/api/masters/${username}`,
)
const { data: services, pending: servicesPending } = await useFetch<Service[]>(
  `/api/masters/${username}/services`,
)

const pending = computed(() => masterPending.value || servicesPending.value)

// Reset wizard state when entering the booking page
onMounted(() => {
  store.resetBooking()
})

async function onSuccess() {
  toast.add({ title: t('pages.booking.created'), color: 'success' })
  await navigateTo(localePath('/client/bookings'))
}
</script>
