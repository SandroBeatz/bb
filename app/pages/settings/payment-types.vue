<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="$t('pages.settings.paymentTypes')" icon="i-heroicons-credit-card" />
    </template>

    <div class="p-6">
      <UEmpty icon="i-heroicons-credit-card" :title="$t('pages.settings.paymentTypes')" description="" />
    </div>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })
</script>
