export default defineEventHandler(async (event) => {
  const masterId = getRouterParam(event, 'id')
  const query = getQuery(event)
  const date = query.date as string | undefined

  if (!masterId) {
    throw createError({ statusCode: 400, message: 'Master ID is required' })
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError({ statusCode: 400, message: 'date query param (YYYY-MM-DD) is required' })
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

  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const workHours = masterData.work_hours as Record<string, { start: number; end: number } | null>
  const dayHours = workHours?.[dayOfWeek]

  if (!dayHours) {
    return []
  }

  const { data: services } = await supabase
    .from('services')
    .select('duration_minutes')
    .eq('master_id', masterId)
    .eq('is_active', true)
    .limit(1)

  const durationMinutes = services?.[0]?.duration_minutes ?? 60

  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('starts_at')
    .eq('master_id', masterId)
    .gte('starts_at', `${date}T00:00:00.000Z`)
    .lt('starts_at', `${date}T23:59:59.999Z`)
    .in('status', ['pending', 'confirmed'])

  const bookedSlots = (existingBookings ?? []).map(b => b.starts_at)

  return generateSlots(date, dayHours.start, dayHours.end, durationMinutes, bookedSlots)
})
