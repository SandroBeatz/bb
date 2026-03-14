export default defineEventHandler(async (event) => {
  const bookingId = getRouterParam(event, 'id')
  const { id: masterId } = await requireMaster(event)

  if (!bookingId) {
    throw createError({ statusCode: 400, message: 'Booking ID is required' })
  }

  const body = await readBody<{
    payment_type_id: string
    amount: number
    note?: string | null
  }>(event)

  if (!body?.payment_type_id || body?.amount == null) {
    throw createError({ statusCode: 400, message: 'payment_type_id and amount are required' })
  }

  const supabase = useServerSupabase()

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, status')
    .eq('id', bookingId)
    .eq('master_id', masterId)
    .single()

  if (!booking) {
    throw createError({ statusCode: 404, message: 'Booking not found' })
  }

  const { data, error } = await supabase
    .from('payment_records')
    .upsert({
      booking_id: bookingId,
      master_id: masterId,
      payment_type_id: body.payment_type_id,
      amount: body.amount,
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  const bookingUpdate: { status: string; notes?: string } = { status: 'completed' }
  if (body.note != null) {
    bookingUpdate.notes = body.note
  }

  await supabase
    .from('bookings')
    .update(bookingUpdate)
    .eq('id', bookingId)

  return data
})
