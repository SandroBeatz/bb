<template>
  <footer class="border-t border-default bg-(--ui-bg)">
    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <!-- Brand -->
        <NuxtLink
          :to="localePath('/')"
          class="font-serif font-light text-xl text-highlighted transition-opacity hover:opacity-75"
        >
          BeautyBook
        </NuxtLink>

        <!-- Links -->
        <nav class="flex flex-wrap gap-x-6 gap-y-2">
          <NuxtLink
            :to="localePath('/about')"
            class="font-sans text-sm text-muted transition-colors hover:text-default"
          >
            {{ t('footer.about') }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/contacts')"
            class="font-sans text-sm text-muted transition-colors hover:text-default"
          >
            {{ t('footer.contacts') }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/for-masters')"
            class="font-sans text-sm text-muted transition-colors hover:text-default"
          >
            {{ t('footer.forMasters') }}
          </NuxtLink>
        </nav>
      </div>

      <!-- Copyright -->
      <p class="mt-8 font-sans text-xs text-muted">
        {{ t('footer.copyright') }}
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>