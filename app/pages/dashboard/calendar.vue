<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="$t('nav.calendar')" icon="i-heroicons-calendar-days" />
    </template>

    <div class="h-full p-6">
      <NuxtCalendar :events="events" />
    </div>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

// TODO: fetch real bookings from /api/master/bookings and map to events
const events = ref([])
</script>
