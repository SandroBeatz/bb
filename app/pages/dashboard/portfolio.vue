<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :toggle="false" :title="$t('nav.portfolio')" icon="i-heroicons-photo" />
    </template>

    <template #body>
      <UContainer>
        <UEmpty icon="i-heroicons-photo" :title="$t('nav.portfolio')" description="" />
      </UContainer>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })
</script>
