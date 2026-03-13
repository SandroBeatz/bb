<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="$t('pages.settings.title')" icon="i-heroicons-cog-6-tooth" />
    </template>

    <div class="p-6">
      <UEmpty icon="i-heroicons-cog-6-tooth" :title="$t('pages.settings.title')" description="" />
    </div>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })
</script>
