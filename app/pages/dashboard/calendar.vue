<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="$t('nav.calendar')" icon="i-heroicons-calendar-days" />
    </template>

    <div class="p-6">
      <UEmpty icon="i-heroicons-calendar-days" :title="$t('nav.calendar')" description="" />
    </div>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })
</script>
