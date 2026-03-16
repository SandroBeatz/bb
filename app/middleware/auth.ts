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

  // Ensure the user has completed onboarding (has a role assigned)
  const supabase = useSupabaseClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId.value!)
    .maybeSingle()

  if (!profile?.role) {
    return navigateTo(localePath('/onboarding'))
  }
})
