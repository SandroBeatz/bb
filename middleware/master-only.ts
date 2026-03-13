export default defineNuxtRouteMiddleware(async () => {
  const { userId } = useAuth()

  if (!userId.value) {
    return navigateTo('/sign-in')
  }

  const supabase = useSupabaseClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId.value)
    .single()

  if (!profile || profile.role !== 'master') {
    return navigateTo('/')
  }
})
