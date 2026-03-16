export default defineEventHandler(async (event) => {
  const masterId = getRouterParam(event, 'username')

  if (!masterId) {
    throw createError({ statusCode: 400, message: 'Master ID is required' })
  }

  const query = getQuery(event)
  const phone = (query.phone as string)?.replace(/\s/g, '')

  if (!phone) {
    throw createError({ statusCode: 400, message: 'phone is required' })
  }

  const supabase = useServerSupabase()

  const { data: client } = await supabase
    .from('clients')
    .select('id, name')
    .eq('master_id', masterId)
    .eq('phone', phone)
    .single()

  if (!client) {
    throw createError({ statusCode: 404, message: 'No bookings found for this phone number' })
  }

  const now = new Date().toISOString()

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, starts_at, ends_at, status, services(name)')
    .eq('master_id', masterId)
    .eq('client_id', client.id)
    .in('status', ['pending', 'confirmed'])
    .gte('starts_at', now)
    .order('starts_at', { ascending: true })

  if (!bookings || bookings.length === 0) {
    throw createError({ statusCode: 404, message: 'No upcoming bookings found' })
  }

  return { client: { name: client.name }, bookings }
})
