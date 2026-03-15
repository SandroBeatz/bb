const CANCEL_HOURS_BEFORE = 24

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event)
  const bookingId = getRouterParam(event, 'id')

  if (!bookingId) {
    throw createError({ statusCode: 400, message: 'Booking ID is required' })
  }

  const supabase = useServerSupabase()

  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('id, starts_at, status, client_id')
    .eq('id', bookingId)
    .eq('client_id', userId)
    .single()

  if (fetchError || !booking) {
    throw createError({ statusCode: 404, message: 'Booking not found' })
  }

  if (booking.status === 'cancelled') {
    throw createError({ statusCode: 400, message: 'Booking is already cancelled' })
  }

  if (booking.status === 'completed') {
    throw createError({ statusCode: 400, message: 'Cannot cancel a completed booking' })
  }

  const hoursFromNow = (new Date(booking.starts_at).getTime() - Date.now()) / (1000 * 60 * 60)

  if (hoursFromNow < CANCEL_HOURS_BEFORE) {
    throw createError({
      statusCode: 400,
      message: `Cannot cancel booking within ${CANCEL_HOURS_BEFORE} hours of start time`,
    })
  }

  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('client_id', userId)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
