<template>
  <UApp class="flex flex-col min-h-screen">
    <NuxtRouteAnnouncer />
    <AppHeader />
    <main class="flex-1 flex flex-col">
      <NuxtPage />
    </main>
    <AppFooter />
    <BottomNav />
  </UApp>
</template>

<script setup lang="ts">
const { isSignedIn } = useAuth()
const { fetch } = useProfile()

watch(isSignedIn, (signed) => {
  if (signed) fetch()
}, { immediate: true })
</script>
