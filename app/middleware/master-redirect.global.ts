/**
 * Global middleware: redirect authenticated masters away from consumer-facing pages.
 * Masters can still view their own public profile (for preview purposes).
 */
export default defineNuxtRouteMiddleware((to) => {
  const { profile } = useProfile()
  const localePath = useLocalePath()

  // Only applies to authenticated masters
  if (profile.value?.role !== 'master') return

  const routeName = String(to.name ?? '')

  // Routes masters should NOT access
  const isLanding = routeName === 'index' || routeName === 'index___ky'
  const isCatalog = routeName.includes('catalog')
  const isForMasters = routeName.includes('for-masters')

  if (isLanding || isCatalog || isForMasters) {
    return navigateTo(localePath('/dashboard'))
  }

  // Master profile pages: allow own profile, redirect from others
  if (routeName.includes('master-username')) {
    const urlUsername = to.params.username as string | undefined
    if (!urlUsername) return

    // Allow if viewing own profile
    if (profile.value.username && urlUsername === profile.value.username) return

    // Block access to other master profiles and booking pages
    return navigateTo(localePath('/dashboard'))
  }
})
