<template>
  <UFooter>
    <template #left>
      <NuxtLink
        :to="localePath('/')"
        class="font-serif font-light text-xl text-highlighted transition-opacity hover:opacity-75"
      >
        BeautyBook
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
