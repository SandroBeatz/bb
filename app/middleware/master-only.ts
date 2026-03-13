export default defineNuxtRouteMiddleware(async () => {
  const { userId } = useAuth()
  const localePath = useLocalePath()

  if (!userId.value) {
    return navigateTo(localePath('/sign-in'))
  }

  const supabase = useSupabaseClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId.value)
    .maybeSingle()

  if (!profile || profile.role !== 'master') {
    return navigateTo('/')
  }
})
