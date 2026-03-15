export default defineEventHandler(async (event) => {
  const bookingId = getRouterParam(event, 'id')
  const { id: masterId } = await requireMaster(event)

  if (!bookingId) {
    throw createError({ statusCode: 400, message: 'Booking ID is required' })
  }

  const body = await readBody<{
    status?: string
    notes?: string
    starts_at?: string
    ends_at?: string
  }>(event)

  if (
    body?.status === undefined &&
    body?.notes === undefined &&
    body?.starts_at === undefined &&
    body?.ends_at === undefined
  ) {
    throw createError({
      statusCode: 400,
      message: 'At least one field is required',
    })
  }

  const updateData: { status?: string; notes?: string; starts_at?: string; ends_at?: string } = {}
  if (body.status !== undefined) updateData.status = body.status
  if (body.notes !== undefined) updateData.notes = body.notes
  if (body.starts_at !== undefined) updateData.starts_at = body.starts_at
  if (body.ends_at !== undefined) updateData.ends_at = body.ends_at

  const supabase = useServerSupabase()

  const { data, error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', bookingId)
    .eq('master_id', masterId)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
