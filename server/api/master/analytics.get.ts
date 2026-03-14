export default defineEventHandler(async (event) => {
  const { id: masterId } = await requireMaster(event)

  const supabase = useServerSupabase()

  const [bookingsResult, revenueResult] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, status, starts_at')
      .eq('master_id', masterId),
    supabase
      .from('payment_records')
      .select('amount')
      .eq('master_id', masterId),
  ])

  const bookings = bookingsResult.data ?? []
  const payments = revenueResult.data ?? []

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const totalBookings = bookings.length
  const completedBookings = bookings.filter(b => b.status === 'completed').length
  const pendingBookings = bookings.filter(b => b.status === 'pending').length

  return {
    totalRevenue,
    totalBookings,
    completedBookings,
    pendingBookings,
  }
})
