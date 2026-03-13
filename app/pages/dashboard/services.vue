<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="$t('nav.services')" icon="i-heroicons-scissors" />
    </template>

    <div class="p-6">
      <UEmpty icon="i-heroicons-scissors" :title="$t('nav.services')" description="" />
    </div>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })
</script>
