<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="$t('nav.portfolio')" icon="i-heroicons-photo" />
    </template>

    <div class="p-6">
      <UEmpty icon="i-heroicons-photo" :title="$t('nav.portfolio')" description="" />
    </div>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })
</script>
