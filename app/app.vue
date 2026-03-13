<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
const { isSignedIn } = useAuth()
const { fetch } = useProfile()

watch(isSignedIn, (signed) => {
  if (signed) fetch()
}, { immediate: true })
</script>
