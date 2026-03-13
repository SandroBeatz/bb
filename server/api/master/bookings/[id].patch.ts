export default defineEventHandler(async (event) => {
  const bookingId = getRouterParam(event, 'id')
  const masterId = requireAuth(event)

  if (!bookingId) {
    throw createError({ statusCode: 400, message: 'Booking ID is required' })
  }

  const body = await readBody<{ status: string }>(event)

  if (!body?.status) {
    throw createError({ statusCode: 400, message: 'status is required' })
  }

  const supabase = useServerSupabase()

  const { data, error } = await supabase
    .from('bookings')
    .update({ status: body.status })
    .eq('id', bookingId)
    .eq('master_id', masterId)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
