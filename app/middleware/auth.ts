export default defineNuxtRouteMiddleware(async (to) => {
  const { isSignedIn, userId } = useAuth()
  const localePath = useLocalePath()

  if (!isSignedIn.value) {
    return navigateTo(localePath('/sign-in'))
  }

  // Onboarding page only requires authentication — skip role check to avoid redirect loop
  if (typeof to.name === 'string' && to.name.includes('onboarding')) {
    return
  }

  // For other protected pages, ensure the user has selected a role
  const supabase = useSupabaseClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId.value!)
    .maybeSingle()

  if (!profile?.role) {
    return navigateTo(localePath('/onboarding'))
  }

  const routeName = String(to.name ?? '')

  // Role-based route protection (route names are locale-independent)
  if (profile.role === 'client') {
    // Client trying to access master dashboard → redirect to client area
    if (routeName.startsWith('dashboard')) {
      return navigateTo(localePath('/client'))
    }
  }

  if (profile.role === 'master') {
    // Master trying to access client-specific pages → redirect to master dashboard
    if (routeName.startsWith('client')) {
      return navigateTo(localePath('/dashboard'))
    }
  }
})
