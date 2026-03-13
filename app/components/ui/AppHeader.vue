<template>
  <UHeader :to="localePath('/')" :title="t('app.name', 'BeautyBook')">
    <template #title>
      <span class="font-serif font-light text-2xl text-highlighted">BeautyBook</span>
    </template>

    <!-- Desktop center nav -->
    <UNavigationMenu :items="navItems" variant="link" color="neutral" />

    <template #right>
      <!-- Locale switcher — two UButtons as segmented control -->
      <div class="hidden sm:flex items-center gap-px rounded-lg bg-elevated p-0.5">
        <UButton
          v-for="l in locales"
          :key="l.code"
          size="xs"
          :variant="locale === l.code ? 'soft' : 'ghost'"
          :color="locale === l.code ? 'primary' : 'neutral'"
          class="min-w-9 uppercase"
          @click="setLocale(l.code as 'ru' | 'ky')"
        >
          {{ l.code }}
        </UButton>
      </div>

      <!-- Auth: cachedUser from cookie → no hydration flash -->
      <template v-if="cachedUser">
        <UDropdownMenu :items="userMenuItems">
          <UButton variant="ghost" size="sm" class="size-10 rounded-full p-0" aria-label="User menu">
            <UAvatar :src="cachedUser.imageUrl" :alt="cachedUser.name" size="sm" />
          </UButton>
        </UDropdownMenu>
      </template>
      <template v-else>
        <UButton :to="localePath('/sign-in')" variant="outline" size="sm" class="hidden sm:flex">
          {{ t('nav.signIn') }}
        </UButton>
      </template>
    </template>

    <!-- Mobile menu body -->
    <template #body>
      <UNavigationMenu :items="mobileNavItems" orientation="vertical" class="-mx-2.5" />

      <USeparator class="my-4" />

      <!-- Auth section -->
      <template v-if="cachedUser">
        <div class="flex items-center justify-between">
          <UUser
            :name="cachedUser.name"
            :avatar="{ src: cachedUser.imageUrl }"
            size="sm"
          />
          <UButton variant="ghost" size="sm" color="neutral" @click="handleSignOut">
            {{ t('nav.signOut') }}
          </UButton>
        </div>
      </template>
      <template v-else>
        <UButton :to="localePath('/sign-in')" variant="solid" size="md" class="w-full">
          {{ t('nav.signIn') }}
        </UButton>
      </template>

      <!-- Locale switcher -->
      <div class="mt-3 flex gap-2">
        <UButton
          v-for="l in locales"
          :key="l.code"
          :variant="locale === l.code ? 'soft' : 'outline'"
          :color="locale === l.code ? 'primary' : 'neutral'"
          size="sm"
          class="flex-1"
          @click="setLocale(l.code as 'ru' | 'ky')"
        >
          {{ t(`language.${l.code}`) }}
        </UButton>
      </div>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { t, locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()
const { isSignedIn, isLoaded } = useAuth()
const { user } = useUser()
const clerk = useClerk()

// Cache user data in cookie — survives page refresh, eliminates auth flash
const userCookie = useCookie<{ imageUrl: string; name: string } | null>('bb_u', {
  default: () => null,
  maxAge: 60 * 60 * 24 * 7, // 1 week
  sameSite: 'lax',
})

// Fill cookie as soon as user data is available
watch(() => user.value, (u) => {
  if (u) {
    userCookie.value = { imageUrl: u.imageUrl, name: u.fullName ?? u.firstName ?? '' }
  }
}, { immediate: true })

// Clear cookie ONLY when Clerk explicitly confirms signed-out (isSignedIn === false)
// undefined = still loading → don't touch cache
watch(isSignedIn, (signed) => {
  if (signed === false) userCookie.value = null
}, { immediate: true })

// Single source of truth: live user data first, cookie as SSR/hydration fallback
const cachedUser = computed(() =>
  user.value
    ? { imageUrl: user.value.imageUrl, name: user.value.fullName ?? user.value.firstName ?? '' }
    : userCookie.value,
)

const navItems = computed<NavigationMenuItem[]>(() => [
  { label: t('nav.catalog'), to: localePath('/catalog') },
  { label: t('nav.forMasters'), to: localePath('/for-masters') },
])

const mobileNavItems = computed<NavigationMenuItem[]>(() => [
  { label: t('nav.catalog'), icon: 'i-heroicons-magnifying-glass', to: localePath('/catalog') },
  { label: t('nav.forMasters'), icon: 'i-heroicons-star', to: localePath('/for-masters') },
  { label: t('footer.about'), icon: 'i-heroicons-information-circle', to: localePath('/about') },
  { label: t('footer.contacts'), icon: 'i-heroicons-envelope', to: localePath('/contacts') },
])

const userMenuItems = computed(() => [
  [
    {
      label: t('nav.dashboard'),
      icon: 'i-heroicons-squares-2x2',
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
  userCookie.value = null
  await clerk.value?.signOut()
  await navigateTo(localePath('/'))
}
</script>
