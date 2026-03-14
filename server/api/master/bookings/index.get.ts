export default defineEventHandler(async (event) => {
  const { id: masterId } = await requireMaster(event)

  const query = getQuery(event)
  const status = query.status as string | undefined

  const supabase = useServerSupabase()
  let queryBuilder = supabase
    .from('bookings')
    .select('*, services(name, price, duration_minutes), profiles!client_id(full_name, avatar_url)')
    .eq('master_id', masterId)
    .order('starts_at', { ascending: false })

  if (status) {
    queryBuilder = queryBuilder.eq('status', status)
  }

  const { data, error } = await queryBuilder

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
