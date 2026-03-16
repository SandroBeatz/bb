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
      <!-- Logo + My Page quick link -->
      <template #header>
        <div class="flex items-center justify-between w-full">
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
          <UTooltip
            v-if="profile?.username"
            :text="t('nav.myProfile')"
            :delay-duration="300"
          >
            <UButton
              :to="localePath(`/master/${profile.username}`)"
              icon="i-heroicons-arrow-top-right-on-square"
              size="xs"
              variant="ghost"
              color="neutral"
              :class="sidebarCollapsed ? 'hidden' : ''"
            />
          </UTooltip>
        </div>
      </template>

      <!-- Navigation -->
      <UNavigationMenu
        :items="sidebarItems"
        orientation="vertical"
        color="neutral"
        :collapsed="sidebarCollapsed"
        class="w-full"
      />

      <!-- User dropdown at bottom -->
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
              <div v-if="!sidebarCollapsed" class="min-w-0 flex-1 text-left">
                <p class="truncate font-sans text-sm font-medium text-highlighted leading-tight">
                  {{ user.fullName ?? user.firstName }}
                </p>
                <p class="truncate text-xs text-muted leading-tight">{{ t('nav.masterRole') }}</p>
              </div>
              <UIcon v-if="!sidebarCollapsed" name="i-heroicons-chevron-up-down" class="size-4 text-muted shrink-0" />
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
        <div class="min-w-0 flex-1">
          <p class="truncate font-semibold text-highlighted">
            {{ user?.fullName ?? user?.firstName ?? t('nav.master') }}
          </p>
          <p class="text-sm text-muted">{{ t('nav.masterRole') }}</p>
        </div>
        <!-- My page quick link -->
        <UButton
          v-if="profile?.username"
          :to="localePath(`/master/${profile.username}`)"
          icon="i-heroicons-arrow-top-right-on-square"
          variant="ghost"
          color="neutral"
          size="sm"
          :label="t('nav.myProfile')"
          @click="mobileMenuOpen = false"
        />
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

      <!-- Sign out -->
      <div class="border-t border-default p-3">
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-heroicons-arrow-right-on-rectangle"
          class="w-full justify-start"
          @click="handleSignOut"
        >
          {{ t('nav.signOut') }}
        </UButton>
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
    {
      label: t('nav.settings'),
      icon: 'i-heroicons-cog-6-tooth',
      to: localePath('/dashboard/settings'),
    },
  ],
])

const userMenuItems = computed(() => [
  [
    ...(profile.value?.username
      ? [
          {
            label: t('nav.myProfile'),
            icon: 'i-heroicons-arrow-top-right-on-square',
            to: localePath(`/master/${profile.value.username}`),
          },
        ]
      : []),
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
