<template>
  <header class="sticky top-0 z-50 border-b border-default bg-(--ui-bg)/95 backdrop-blur-md">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <!-- Logo -->
      <NuxtLink
        :to="localePath('/')"
        class="shrink-0 font-serif font-light text-2xl text-highlighted transition-opacity hover:opacity-75"
      >
        BeautyBook
      </NuxtLink>

      <!-- Desktop Navigation -->
      <nav class="hidden items-center gap-6 md:flex">
        <NuxtLink
          :to="localePath('/catalog')"
          class="font-sans font-medium text-sm text-default transition-colors hover:text-primary"
          active-class="text-primary"
        >
          {{ t('nav.catalog') }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/for-masters')"
          class="font-sans font-medium text-sm text-default transition-colors hover:text-primary"
          active-class="text-primary"
        >
          {{ t('nav.forMasters') }}
        </NuxtLink>
      </nav>

      <!-- Right actions -->
      <div class="flex items-center gap-2">
        <!-- Language switcher pill -->
        <div class="hidden items-center gap-0.5 rounded-md bg-muted p-0.5 sm:flex">
          <button
            v-for="l in locales"
            :key="l.code"
            type="button"
            :class="[
              'min-h-[28px] min-w-[28px] rounded px-2 py-0.5 font-sans text-xs font-medium uppercase transition-all',
              locale === l.code
                ? 'bg-(--ui-bg) text-highlighted shadow-sm'
                : 'text-muted hover:text-default',
            ]"
            @click="setLocale(l.code as 'ru' | 'ky')"
          >
            {{ l.code }}
          </button>
        </div>

        <!-- Signed in: avatar + dropdown -->
        <template v-if="isSignedIn && user">
          <UDropdownMenu :items="userMenuItems">
            <UButton variant="ghost" size="sm" class="size-10 rounded-full p-0">
              <UAvatar
                :src="user.imageUrl"
                :alt="user.fullName ?? user.firstName ?? ''"
                size="sm"
              />
            </UButton>
          </UDropdownMenu>
        </template>

        <!-- Not signed in: Sign In -->
        <template v-else>
          <NuxtLink :to="localePath('/sign-in')" class="hidden sm:block">
            <UButton variant="outline" size="sm" class="font-sans font-medium">
              {{ t('nav.signIn') }}
            </UButton>
          </NuxtLink>
        </template>

        <!-- Mobile burger (UDrawer trigger) -->
        <UDrawer
          v-model:open="mobileMenuOpen"
          direction="left"
          class="md:hidden"
          :ui="{ content: 'w-72 rounded-r-2xl' }"
        >
          <UButton
            variant="ghost"
            size="sm"
            class="min-h-[44px] min-w-[44px]"
            aria-label="Меню"
          >
            <UIcon name="i-heroicons-bars-3" class="size-6" />
          </UButton>

          <template #content>
            <div class="flex h-full flex-col">
              <!-- Drawer header -->
              <div class="flex items-center justify-between border-b border-default px-4 py-4">
                <span class="font-serif font-light text-xl text-highlighted">BeautyBook</span>
                <UButton
                  variant="ghost"
                  size="sm"
                  class="min-h-[44px] min-w-[44px]"
                  aria-label="Закрыть"
                  @click="mobileMenuOpen = false"
                >
                  <UIcon name="i-heroicons-x-mark" class="size-5" />
                </UButton>
              </div>

              <!-- Nav links -->
              <nav class="flex flex-col gap-1 p-3">
                <NuxtLink
                  v-for="link in mobileNavLinks"
                  :key="link.to"
                  :to="link.to"
                  class="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 font-sans font-medium text-sm text-default transition-colors hover:bg-muted"
                  active-class="bg-primary-50 text-primary dark:bg-primary-950/30"
                  @click="mobileMenuOpen = false"
                >
                  <UIcon :name="link.icon" class="size-5 shrink-0" />
                  {{ link.label }}
                </NuxtLink>
              </nav>

              <!-- Auth + language — pinned to bottom -->
              <div class="mt-auto space-y-3 border-t border-default p-4">
                <template v-if="isSignedIn && user">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <UAvatar
                        :src="user.imageUrl"
                        :alt="user.fullName ?? user.firstName ?? ''"
                        size="sm"
                      />
                      <p class="font-sans font-medium text-sm text-highlighted">
                        {{ user.firstName }}
                      </p>
                    </div>
                    <UButton variant="ghost" size="sm" @click="handleSignOut">
                      {{ t('nav.signOut') }}
                    </UButton>
                  </div>
                </template>
                <template v-else>
                  <NuxtLink
                    :to="localePath('/sign-in')"
                    class="block"
                    @click="mobileMenuOpen = false"
                  >
                    <UButton variant="solid" size="md" class="w-full font-sans font-medium">
                      {{ t('nav.signIn') }}
                    </UButton>
                  </NuxtLink>
                </template>

                <!-- Language switcher -->
                <div class="flex items-center gap-2">
                  <button
                    v-for="l in locales"
                    :key="l.code"
                    type="button"
                    :class="[
                      'min-h-[44px] flex-1 rounded-lg border px-3 py-2 font-sans text-sm font-medium transition-colors',
                      locale === l.code
                        ? 'border-primary bg-primary-50 text-primary dark:bg-primary-950/30'
                        : 'border-default text-muted hover:text-default',
                    ]"
                    @click="setLocale(l.code as 'ru' | 'ky')"
                  >
                    {{ t(`language.${l.code}`) }}
                  </button>
                </div>
              </div>
            </div>
          </template>
        </UDrawer>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { t, locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()
const { isSignedIn, signOut } = useAuth()
const { user } = useUser()

const mobileMenuOpen = ref(false)

// Close mobile menu on navigation
const route = useRoute()
watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false
  },
)

const mobileNavLinks = computed(() => [
  { to: localePath('/'), icon: 'i-heroicons-home', label: t('nav.home') },
  {
    to: localePath('/catalog'),
    icon: 'i-heroicons-magnifying-glass',
    label: t('nav.catalog'),
  },
  {
    to: localePath('/for-masters'),
    icon: 'i-heroicons-sparkles',
    label: t('nav.forMasters'),
  },
])

const userMenuItems = computed(() => [
  [
    {
      label: t('nav.profile'),
      icon: 'i-heroicons-user',
      to: localePath('/dashboard'),
    },
    {
      label: t('nav.settings'),
      icon: 'i-heroicons-cog-6-tooth',
      to: localePath('/settings'),
    },
  ],
  [
    {
      label: t('nav.signOut'),
      icon: 'i-heroicons-arrow-right-on-rectangle',
      onSelect: () => handleSignOut(),
    },
  ],
])

async function handleSignOut() {
  await signOut()
  mobileMenuOpen.value = false
  await navigateTo(localePath('/'))
}
</script>
