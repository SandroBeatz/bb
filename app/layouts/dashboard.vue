<template>
  <UDashboardGroup data-bb-dashboard>
    <!-- Sidebar — desktop only -->
    <UDashboardSidebar
      v-model:collapsed="sidebarCollapsed"
      class="hidden md:flex"
      resizable
      collapsible
      :min-size="14"
      :default-size="22"
      :max-size="30"
    >
      <!-- Logo -->
      <template #header>
        <NuxtLink :to="localePath('/')" class="flex items-center transition-opacity hover:opacity-75">
          <img
            v-if="!sidebarCollapsed"
            src="~/assets/img/bb-logo.svg"
            alt="BeautyBook"
            class="h-7 w-auto"
          />
          <img
            v-else
            src="~/assets/img/favicon/favicon.svg"
            alt="BB"
            class="size-7"
          />
        </NuxtLink>
      </template>

      <!-- Navigation -->
      <UNavigationMenu
        :items="sidebarItems"
        orientation="vertical"
        color="neutral"
        :collapsed="sidebarCollapsed"
        class="w-full"
      />

      <!-- User footer -->
      <template #footer>
        <template v-if="isSignedIn && user">
          <UDropdownMenu :items="userMenuItems">
            <UButton
              variant="ghost"
              color="neutral"
              class="w-full"
              :class="sidebarCollapsed ? 'justify-center px-2' : 'justify-start gap-2 px-2'"
            >
              <UAvatar :src="user.imageUrl" :alt="user.fullName ?? ''" size="sm" />
              <span v-if="!sidebarCollapsed" class="min-w-0 truncate font-sans text-sm font-medium text-highlighted">
                {{ user.fullName ?? user.firstName }}
              </span>
            </UButton>
          </UDropdownMenu>
        </template>
      </template>
    </UDashboardSidebar>

    <!-- Page content via slot -->
    <slot />
  </UDashboardGroup>

  <!-- Mobile bottom navigation -->
  <nav class="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-default bg-default/95 backdrop-blur-md">
    <div class="flex items-stretch" style="padding-bottom: env(safe-area-inset-bottom, 0px)">
      <NuxtLink
        v-for="tab in mobileTabs"
        :key="tab.to"
        :to="tab.to"
        class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-muted transition-colors"
        active-class="!text-primary"
        :exact="tab.exact"
      >
        <UIcon :name="tab.icon" class="size-6" />
        <span class="text-[10px] font-medium leading-tight">{{ tab.label }}</span>
      </NuxtLink>

      <!-- More / Menu button -->
      <button
        class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors"
        :class="mobileMenuOpen ? 'text-primary' : 'text-muted'"
        @click="mobileMenuOpen = true"
      >
        <UIcon name="i-heroicons-bars-3" class="size-6" />
        <span class="text-[10px] font-medium leading-tight">{{ t('nav.menu') }}</span>
      </button>
    </div>
  </nav>

  <!-- Mobile menu drawer -->
  <UDrawer v-model:open="mobileMenuOpen" class="md:hidden">
    <template #content>
      <!-- User card -->
      <div class="flex items-center gap-3 border-b border-default px-5 py-4">
        <UAvatar
          :src="user?.imageUrl"
          :alt="user?.fullName ?? ''"
          size="md"
        />
        <div class="min-w-0">
          <p class="truncate font-semibold text-highlighted">
            {{ user?.fullName ?? user?.firstName ?? t('nav.master') }}
          </p>
          <p class="text-sm text-muted">{{ t('nav.masterRole') }}</p>
        </div>
      </div>

      <!-- Nav items -->
      <div class="p-3">
        <UNavigationMenu
          :items="sidebarItems"
          orientation="vertical"
          color="neutral"
          class="w-full"
          @click="mobileMenuOpen = false"
        />
      </div>

    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { t } = useI18n()
const localePath = useLocalePath()
const { isSignedIn } = useAuth()
const { user } = useUser()
const clerk = useClerk()
const { profile } = useProfile()

const sidebarCollapsed = ref(false)
const mobileMenuOpen = ref(false)

const mobileTabs = computed(() => [
  {
    label: t('nav.dashboard'),
    icon: 'i-heroicons-squares-2x2',
    to: localePath('/dashboard'),
    exact: true,
  },
  {
    label: t('nav.calendar'),
    icon: 'i-heroicons-calendar-days',
    to: localePath('/dashboard/calendar'),
    exact: false,
  },
  {
    label: t('nav.services'),
    icon: 'i-heroicons-scissors',
    to: localePath('/dashboard/services'),
    exact: false,
  },
  {
    label: t('nav.clients'),
    icon: 'i-heroicons-users',
    to: localePath('/dashboard/clients'),
    exact: false,
  },
])

const sidebarItems = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: t('nav.dashboard'),
      icon: 'i-heroicons-squares-2x2',
      to: localePath('/dashboard'),
    },
    {
      label: t('nav.calendar'),
      icon: 'i-heroicons-calendar-days',
      to: localePath('/dashboard/calendar'),
    },
    {
      label: t('nav.services'),
      icon: 'i-heroicons-scissors',
      to: localePath('/dashboard/services'),
    },
    {
      label: t('nav.portfolio'),
      icon: 'i-heroicons-photo',
      to: localePath('/dashboard/portfolio'),
    },
    {
      label: t('nav.clients'),
      icon: 'i-heroicons-users',
      to: localePath('/dashboard/clients'),
    },
    {
      label: t('nav.analytics'),
      icon: 'i-heroicons-chart-bar',
      to: localePath('/dashboard/analytics'),
    },
  ],
  [
    {
      label: t('nav.settings'),
      icon: 'i-heroicons-cog-6-tooth',
      to: localePath('/dashboard/settings'),
    },
    {
      label: t('nav.myProfile'),
      icon: 'i-heroicons-eye',
      to: profile.value?.username ? localePath(`/master/${profile.value.username}`) : undefined,
    },
  ],
])

const userMenuItems = computed(() => [
  [
    {
      label: t('nav.settings'),
      icon: 'i-heroicons-cog-6-tooth',
      to: localePath('/dashboard/settings'),
    },
  ],
  [
    {
      label: t('nav.signOut'),
      icon: 'i-heroicons-arrow-right-on-rectangle',
      onSelect: async () => {
        await clerk.value?.signOut()
        await navigateTo(localePath('/'))
      },
    },
  ],
])

async function handleSignOut() {
  mobileMenuOpen.value = false
  await clerk.value?.signOut()
  await navigateTo(localePath('/'))
}
</script>
