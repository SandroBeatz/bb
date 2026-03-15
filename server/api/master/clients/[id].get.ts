export default defineEventHandler(async (event) => {
  const { id: masterId } = await requireMaster(event)
  const clientId = getRouterParam(event, 'id')

  if (!clientId) {
    throw createError({ statusCode: 400, message: 'Client ID is required' })
  }

  const supabase = useServerSupabase()

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(
      'id, starts_at, ends_at, status, notes, services(id, name, price, duration_minutes), payment_records(amount)',
    )
    .eq('master_id', masterId)
    .eq('client_id', clientId)
    .order('starts_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  // Normalize payment_records to always be an array
  const normalized = (bookings ?? []).map((b) => {
    const raw = b.payment_records
    return { ...b, payment_records: Array.isArray(raw) ? raw : raw ? [raw] : [] }
  })

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('id', clientId)
    .single()

  if (profileError || !profile) {
    throw createError({ statusCode: 404, message: 'Client not found' })
  }

  return { profile, bookings: normalized }
})
