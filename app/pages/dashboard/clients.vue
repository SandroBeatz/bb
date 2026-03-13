<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="$t('nav.clients')" icon="i-heroicons-users" />
    </template>

    <div class="p-6">
      <UEmpty icon="i-heroicons-users" :title="$t('nav.clients')" description="" />
    </div>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })
</script>
