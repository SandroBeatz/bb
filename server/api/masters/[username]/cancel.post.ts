export default defineEventHandler(async (event) => {
  const masterId = getRouterParam(event, 'username')

  if (!masterId) {
    throw createError({ statusCode: 400, message: 'Master ID is required' })
  }

  const body = await readBody<{ phone: string; bookingId: string; reason?: string }>(event)

  if (!body?.phone) {
    throw createError({ statusCode: 400, message: 'phone is required' })
  }

  if (!body?.bookingId) {
    throw createError({ statusCode: 400, message: 'bookingId is required' })
  }

  const supabase = useServerSupabase()
  const phone = body.phone.replace(/\s/g, '')

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('master_id', masterId)
    .eq('phone', phone)
    .single()

  if (!client) {
    throw createError({ statusCode: 404, message: 'No bookings found for this phone number' })
  }

  // Verify the booking belongs to this client and master
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, status')
    .eq('id', body.bookingId)
    .eq('master_id', masterId)
    .eq('client_id', client.id)
    .in('status', ['pending', 'confirmed'])
    .single()

  if (!booking) {
    throw createError({ statusCode: 404, message: 'Booking not found' })
  }

  const updateData: { status: string; notes?: string } = { status: 'cancelled' }
  if (body.reason?.trim()) {
    updateData.notes = body.reason.trim()
  }

  const { error } = await supabase.from('bookings').update(updateData).eq('id', booking.id)

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { cancelled: true }
})
