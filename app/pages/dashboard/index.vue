<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="$t('nav.dashboard')" />
    </template>

    <div class="p-6">
      <UEmpty
        icon="i-heroicons-squares-2x2"
        :title="$t('nav.dashboard')"
        description=""
      />
    </div>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })
</script>
