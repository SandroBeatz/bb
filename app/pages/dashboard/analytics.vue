<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="$t('pages.dashboard.analytics')" icon="i-heroicons-chart-bar" />
    </template>

    <div class="p-6">
      <UEmpty icon="i-heroicons-chart-bar" :title="$t('pages.dashboard.analytics')" description="" />
    </div>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })
</script>
