export default defineEventHandler(async (event) => {
  const userId = requireAuth(event)

  const { booking_id, rating, comment } = await readBody(event)

  if (!booking_id || typeof rating !== 'number' || rating < 1 || rating > 5) {
    throw createError({ statusCode: 400, message: 'Invalid data: booking_id and rating (1–5) are required' })
  }

  const supabase = useServerSupabase()

  // Fetch booking to validate ownership and status
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, master_id, client_id, status')
    .eq('id', booking_id)
    .single()

  if (bookingError || !booking) {
    throw createError({ statusCode: 404, message: 'Booking not found' })
  }

  if (booking.client_id !== userId) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  if (booking.status !== 'completed') {
    throw createError({ statusCode: 422, message: 'Booking must be completed before leaving a review' })
  }

  // Check for existing review on this booking
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', booking_id)
    .maybeSingle()

  if (existing) {
    throw createError({ statusCode: 409, message: 'Review already exists for this booking' })
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      booking_id,
      master_id: booking.master_id,
      client_id: userId,
      rating: Math.round(rating),
      comment: comment?.trim() || null,
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
