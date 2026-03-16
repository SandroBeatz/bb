export default defineEventHandler(async (event) => {
  const masterId = getRouterParam(event, 'username')

  if (!masterId) {
    throw createError({ statusCode: 400, message: 'Master ID is required' })
  }

  const body = await readBody<{
    service_id: string
    starts_at: string
    client_name: string
    client_phone: string
    notes?: string
  }>(event)

  if (!body?.service_id || !body?.starts_at || !body?.client_name || !body?.client_phone) {
    throw createError({
      statusCode: 400,
      message: 'service_id, starts_at, client_name and client_phone are required',
    })
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
    throw createError({
      statusCode: 409,
      message: 'Time slot is already booked',
    })
  }

  // Find or create client by phone
  const phone = body.client_phone.replace(/\s/g, '')
  let clientId: string

  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('master_id', masterId)
    .eq('phone', phone)
    .single()

  if (existingClient) {
    clientId = existingClient.id
  } else {
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        master_id: masterId,
        phone,
        name: body.client_name,
      })
      .select('id')
      .single()

    if (clientError || !newClient) {
      throw createError({ statusCode: 500, message: 'Failed to create client' })
    }
    clientId = newClient.id
  }

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
