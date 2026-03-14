export default defineEventHandler(async (event) => {
  const masterId = getRouterParam(event, 'id')
  const query = getQuery(event)
  const date = query.date as string | undefined

  if (!masterId) {
    throw createError({ statusCode: 400, message: 'Master ID is required' })
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError({
      statusCode: 400,
      message: 'date query param (YYYY-MM-DD) is required',
    })
  }

  const supabase = useServerSupabase()

  const { data: masterData, error: masterError } = await supabase
    .from('master_profiles')
    .select('work_hours')
    .eq('id', masterId)
    .single()

  if (masterError || !masterData) {
    throw createError({ statusCode: 404, message: 'Master not found' })
  }

  const workHours = masterData.work_hours as Record<string, { start: number; end: number } | null>

  const serviceId = query.service_id as string | undefined
  let durationMinutes = 60

  if (serviceId) {
    const { data: service } = await supabase
      .from('services')
      .select('duration_minutes')
      .eq('id', serviceId)
      .eq('master_id', masterId)
      .eq('is_active', true)
      .single()
    if (service) durationMinutes = service.duration_minutes
  } else {
    const { data: services } = await supabase
      .from('services')
      .select('duration_minutes')
      .eq('master_id', masterId)
      .eq('is_active', true)
      .limit(1)
    durationMinutes = services?.[0]?.duration_minutes ?? 60
  }

  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('starts_at, ends_at')
    .eq('master_id', masterId)
    .gte('starts_at', `${date}T00:00:00.000Z`)
    .lt('starts_at', `${date}T23:59:59.999Z`)
    .in('status', ['pending', 'confirmed'])

  return generateSlots(workHours, existingBookings ?? [], date, durationMinutes)
})
