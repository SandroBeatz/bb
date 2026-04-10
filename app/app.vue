<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>

  <PiniaColadaDevtools  />
</template>

<script setup lang="ts">
import { PiniaColadaDevtools } from '@pinia/colada-devtools'
// useQuery внутри useProfile автоматически активируется при isSignedIn
useProfile()
</script>
