<template>
  <UDashboardGroup>
    <UDashboardSidebar
      v-model:collapsed="sidebarCollapsed"
      resizable
      collapsible
      :min-size="14"
      :default-size="22"
      :max-size="30"
    >
      <!-- Logo -->
      <template #header>
        <NuxtLink
          :to="localePath('/')"
          class="flex items-center gap-2 transition-opacity hover:opacity-75"
        >
          <span class="font-serif font-light text-xl text-highlighted">
            {{ sidebarCollapsed ? 'B' : 'BeautyBook' }}
          </span>
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
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { t } = useI18n()
const localePath = useLocalePath()
const { isSignedIn } = useAuth()
const { user } = useUser()
const clerk = useClerk()

const sidebarCollapsed = ref(false)

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
      to: localePath('/settings'),
    },
  ],
])

const userMenuItems = computed(() => [
  [
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
      onSelect: async () => {
        await clerk.value?.signOut()
        await navigateTo(localePath('/'))
      },
    },
  ],
])
</script>
