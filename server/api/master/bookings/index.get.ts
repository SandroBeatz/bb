export default defineEventHandler(async (event) => {
  const { id: masterId } = await requireMaster(event)

  const query = getQuery(event)
  const status = query.status as string | undefined
  const from = query.from as string | undefined
  const to = query.to as string | undefined

  const supabase = useServerSupabase()
  let queryBuilder = supabase
    .from('bookings')
    .select('*, services(name, price, duration_minutes), clients!client_id(name, phone)')
    .eq('master_id', masterId)
    .order('starts_at', { ascending: true })

  if (status) {
    queryBuilder = queryBuilder.eq('status', status)
  }

  if (from) {
    queryBuilder = queryBuilder.gte('starts_at', from)
  }

  if (to) {
    queryBuilder = queryBuilder.lte('starts_at', to)
  }

  const { data, error } = await queryBuilder

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
