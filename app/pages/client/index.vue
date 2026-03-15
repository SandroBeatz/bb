<template>
  <UContainer class="py-6">
    <h1 class="text-2xl font-bold mb-2">{{ $t('pages.client.dashboardTitle') }}</h1>
    <p class="text-muted mb-8">{{ $t('pages.client.dashboardSubtitle') }}</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Bookings -->
      <UCard
        as="div"
        class="cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        @click="navigateTo(localePath('/client/bookings'))"
      >
        <div class="flex items-center gap-4">
          <div class="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <UIcon name="i-heroicons-calendar-days" class="size-6 text-primary" />
          </div>
          <div>
            <p class="font-semibold text-highlighted">{{ $t('nav.bookings') }}</p>
            <p class="text-sm text-muted">{{ $t('pages.client.myBookingsDesc') }}</p>
          </div>
        </div>
      </UCard>

      <!-- Find masters -->
      <UCard
        as="div"
        class="cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        @click="navigateTo(localePath('/catalog'))"
      >
        <div class="flex items-center gap-4">
          <div class="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <UIcon name="i-heroicons-magnifying-glass" class="size-6 text-primary" />
          </div>
          <div>
            <p class="font-semibold text-highlighted">{{ $t('pages.client.findMasters') }}</p>
            <p class="text-sm text-muted">{{ $t('pages.client.findMastersDesc') }}</p>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'client-only' })

const localePath = useLocalePath()
</script>
