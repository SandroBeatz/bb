<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-40 border-t border-default bg-(--ui-bg) pb-safe md:hidden"
    aria-label="Bottom navigation"
  >
    <div class="flex items-stretch">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex flex-1 flex-col items-center justify-center gap-1 py-2 font-sans text-xs font-medium text-muted transition-colors hover:text-default"
        active-class="text-primary"
        exact-active-class="text-primary"
      >
        <UIcon :name="item.icon" class="size-6 shrink-0" />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { isSignedIn } = useAuth()

const navItems = computed(() => [
  {
    to: localePath('/'),
    icon: 'i-heroicons-home',
    label: t('nav.home'),
  },
  {
    to: isSignedIn.value ? localePath('/dashboard') : localePath('/sign-in'),
    icon: 'i-heroicons-user',
    label: isSignedIn.value ? t('nav.dashboard') : t('nav.signIn'),
  },
])
</script>
