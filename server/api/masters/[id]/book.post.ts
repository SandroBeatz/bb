export default defineEventHandler(async (event) => {
  const masterId = getRouterParam(event, 'id')

  if (!masterId) {
    throw createError({ statusCode: 400, message: 'Master ID is required' })
  }

  const body = await readBody<{
    service_id: string
    starts_at: string
    notes?: string
  }>(event)

  if (!body?.service_id || !body?.starts_at) {
    throw createError({ statusCode: 400, message: 'service_id and starts_at are required' })
  }

  const supabase = useServerSupabase()

  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('id, duration_minutes, master_id, is_active')
    .eq('id', body.service_id)
    .eq('master_id', masterId)
    .single()

  if (serviceError || !service || !service.is_active) {
    throw createError({ statusCode: 404, message: 'Service not found' })
  }

  const startsAt = new Date(body.starts_at)
  const endsAt = new Date(startsAt.getTime() + service.duration_minutes * 60_000)

  const { data: conflict } = await supabase
    .from('bookings')
    .select('id')
    .eq('master_id', masterId)
    .lt('starts_at', endsAt.toISOString())
    .gt('ends_at', startsAt.toISOString())
    .in('status', ['pending', 'confirmed'])
    .limit(1)

  if (conflict && conflict.length > 0) {
    throw createError({ statusCode: 409, message: 'Time slot is already booked' })
  }

  const clientId = requireAuth(event)

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      master_id: masterId,
      client_id: clientId,
      service_id: body.service_id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      notes: body.notes ?? null,
      source: 'online',
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return booking
})
