export default defineEventHandler(async () => {
  const { userId } = useAuth()

  if (!userId?.value) {
    throw createError({ statusCode: 401, message: 'Authentication required' })
  }

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select('*, master_profiles(*)')
    .eq('id', userId.value)
    .single()

  if (error) {
    throw createError({ statusCode: 404, message: 'Profile not found' })
  }

  return data
})
