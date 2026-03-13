export default defineEventHandler(async () => {
  const { userId } = useAuth()

  if (!userId?.value) {
    throw createError({ statusCode: 401, message: 'Authentication required' })
  }

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('bookings')
    .select('*, services(name, price), profiles!master_id(full_name, username, avatar_url)')
    .eq('client_id', userId.value)
    .order('starts_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
