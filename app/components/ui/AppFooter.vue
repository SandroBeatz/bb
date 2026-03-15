<template>
  <!-- Mobile: copyright only, with clearance for fixed bottom nav -->
  <div
    class="md:hidden border-t border-default py-3 px-4 text-center"
    style="padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 3.5rem)"
  >
    <p class="font-sans text-xs text-muted">
      {{ t('footer.copyright') }}
    </p>
  </div>

  <!-- Desktop: full footer -->
  <UFooter class="hidden md:flex">
    <template #left>
      <NuxtLink :to="localePath('/')" class="transition-opacity hover:opacity-75">
        <img src="~/assets/img/bb-logo.svg" alt="BeautyBook" class="h-6 w-auto" />
      </NuxtLink>
    </template>

    <UNavigationMenu :items="footerItems" variant="link" color="neutral" />

    <template #right>
      <p class="font-sans text-xs text-muted">
        {{ t('footer.copyright') }}
      </p>
    </template>
  </UFooter>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { t } = useI18n()
const localePath = useLocalePath()

const footerItems = computed<NavigationMenuItem[]>(() => [
  { label: t('footer.about'), to: localePath('/about') },
  { label: t('footer.contacts'), to: localePath('/contacts') },
  { label: t('footer.forMasters'), to: localePath('/for-masters') },
])
</script>
