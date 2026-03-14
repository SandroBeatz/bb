export default defineEventHandler(async (event) => {
  const { id: masterId } = await requireMaster(event)

  const supabase = useServerSupabase()

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

  const [bookingsResult, revenueResult, todayPaymentsResult, monthPaymentsResult] = await Promise.all([
    supabase
      .from('bookings')
      .select('id, status, starts_at')
      .eq('master_id', masterId),
    supabase
      .from('payment_records')
      .select('amount')
      .eq('master_id', masterId),
    supabase
      .from('payment_records')
      .select('amount')
      .eq('master_id', masterId)
      .gte('created_at', todayStart)
      .lt('created_at', todayEnd),
    supabase
      .from('payment_records')
      .select('amount')
      .eq('master_id', masterId)
      .gte('created_at', monthStart)
      .lt('created_at', monthEnd),
  ])

  const bookings = bookingsResult.data ?? []
  const payments = revenueResult.data ?? []
  const todayPayments = todayPaymentsResult.data ?? []
  const monthPayments = monthPaymentsResult.data ?? []

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const totalBookings = bookings.length
  const completedBookings = bookings.filter(b => b.status === 'completed').length
  const pendingBookings = bookings.filter(b => b.status === 'pending').length

  const todayBookingsCount = bookings.filter(
    b => b.starts_at >= todayStart && b.starts_at < todayEnd && b.status !== 'cancelled',
  ).length
  const todayRevenue = todayPayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const monthRevenue = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0)

  return {
    totalRevenue,
    totalBookings,
    completedBookings,
    pendingBookings,
    todayBookings: todayBookingsCount,
    todayRevenue,
    monthRevenue,
  }
})
