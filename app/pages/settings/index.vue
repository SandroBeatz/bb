<template>
  <main class="p-8">
    <h1 class="text-2xl font-bold">{{ $t('pages.settings.title') }}</h1>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>
