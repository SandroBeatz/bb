export default defineEventHandler(async (event) => {
  const userId = requireAuth(event)

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('bookings')
    .select(
      '*, services(name, price), profiles!master_id(full_name, username, avatar_url), reviews(id)',
    )
    .eq('client_id', userId)
    .order('starts_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
