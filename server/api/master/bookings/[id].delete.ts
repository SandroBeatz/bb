export default defineEventHandler(async (event) => {
  const bookingId = getRouterParam(event, 'id')
  const { id: masterId } = await requireMaster(event)

  if (!bookingId) {
    throw createError({ statusCode: 400, message: 'Booking ID is required' })
  }

  const supabase = useServerSupabase()

  // Only allow deleting cancelled bookings
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('id, status')
    .eq('id', bookingId)
    .eq('master_id', masterId)
    .single()

  if (fetchError || !booking) {
    throw createError({ statusCode: 404, message: 'Booking not found' })
  }

  if (booking.status !== 'cancelled') {
    throw createError({
      statusCode: 400,
      message: 'Only cancelled bookings can be deleted',
    })
  }

  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId)
    .eq('master_id', masterId)

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { success: true }
})
