<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :toggle="false" :title="$t('pages.dashboard.analytics')" icon="i-heroicons-chart-bar" />
    </template>

    <template #body>
      <UContainer>
        <UEmpty icon="i-heroicons-chart-bar" :title="$t('pages.dashboard.analytics')" description="" />
      </UContainer>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })
</script>
