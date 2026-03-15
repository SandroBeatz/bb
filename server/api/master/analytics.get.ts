export default defineEventHandler(async (event) => {
  const { id: masterId } = await requireMaster(event)

  const query = getQuery(event)
  const period = (query.period as string) || 'month'

  const supabase = useServerSupabase()

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  // Determine period window using UTC dates (matches ISO timestamps in DB)
  const periodDays = period === 'week' ? 7 : period === 'quarter' ? 90 : 30
  const nowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const periodStartUTC = new Date(nowUTC)
  periodStartUTC.setUTCDate(periodStartUTC.getUTCDate() - (periodDays - 1))
  const periodEndUTC = new Date(nowUTC)
  periodEndUTC.setUTCDate(periodEndUTC.getUTCDate() + 1) // exclusive upper bound

  const [
    bookingsResult,
    revenueResult,
    todayPaymentsResult,
    monthPaymentsResult,
    periodBookingsResult,
    periodPaymentsResult,
    servicesResult,
    paymentTypesResult,
    priorBookingsResult,
  ] = await Promise.all([
    supabase.from('bookings').select('id, status, starts_at').eq('master_id', masterId),
    supabase.from('payment_records').select('amount').eq('master_id', masterId),
    supabase
      .from('payment_records')
      .select('amount')
      .eq('master_id', masterId)
      .gte('recorded_at', todayStart.toISOString())
      .lt('recorded_at', todayEnd.toISOString()),
    supabase
      .from('payment_records')
      .select('amount')
      .eq('master_id', masterId)
      .gte('recorded_at', monthStart.toISOString())
      .lt('recorded_at', monthEnd.toISOString()),
    supabase
      .from('bookings')
      .select('id, status, starts_at, client_id, source, service_id')
      .eq('master_id', masterId)
      .gte('starts_at', periodStartUTC.toISOString())
      .lt('starts_at', periodEndUTC.toISOString()),
    supabase
      .from('payment_records')
      .select('amount, recorded_at, payment_type_id, booking_id')
      .eq('master_id', masterId)
      .gte('recorded_at', periodStartUTC.toISOString())
      .lt('recorded_at', periodEndUTC.toISOString()),
    supabase.from('services').select('id, name').eq('master_id', masterId),
    supabase.from('payment_types').select('id, name').eq('master_id', masterId),
    supabase
      .from('bookings')
      .select('client_id')
      .eq('master_id', masterId)
      .lt('starts_at', periodStartUTC.toISOString()),
  ])

  const bookings = bookingsResult.data ?? []
  const payments = revenueResult.data ?? []
  const todayPayments = todayPaymentsResult.data ?? []
  const monthPayments = monthPaymentsResult.data ?? []
  const periodBookings = periodBookingsResult.data ?? []
  const periodPayments = periodPaymentsResult.data ?? []
  const services = servicesResult.data ?? []
  const paymentTypes = paymentTypesResult.data ?? []
  const priorBookings = priorBookingsResult.data ?? []

  // ── Legacy KPIs (all-time / today / this month) ──────────────────────────
  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const totalBookings = bookings.length
  const completedBookings = bookings.filter((b) => b.status === 'completed').length
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length
  const todayStr = todayStart.toISOString().slice(0, 10)
  const todayBookingsCount = bookings.filter(
    (b) => b.starts_at.slice(0, 10) === todayStr && b.status !== 'cancelled',
  ).length
  const todayRevenue = todayPayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const monthRevenue = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0)

  // ── Period KPIs ───────────────────────────────────────────────────────────
  const activeInPeriod = periodBookings.filter((b) => b.status !== 'cancelled')
  const periodRevenue = periodPayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const periodBookingsCount = activeInPeriod.length
  const avgCheck = periodBookingsCount > 0 ? Math.round(periodRevenue / periodBookingsCount) : 0

  // ── Revenue by day (for line chart) ──────────────────────────────────────
  const revByDate = new Map<string, number>()
  for (const p of periodPayments) {
    const d = p.recorded_at.slice(0, 10)
    revByDate.set(d, (revByDate.get(d) ?? 0) + Number(p.amount))
  }

  // ── Bookings by day (for bar chart) ──────────────────────────────────────
  const bkgByDate = new Map<string, number>()
  for (const b of activeInPeriod) {
    const d = b.starts_at.slice(0, 10)
    bkgByDate.set(d, (bkgByDate.get(d) ?? 0) + 1)
  }

  // Fill in all dates in the period (UTC)
  const revenueByDay: { date: string; amount: number }[] = []
  const bookingsByDay: { date: string; count: number }[] = []
  const cursor = new Date(periodStartUTC)
  while (cursor < periodEndUTC) {
    const d = cursor.toISOString().slice(0, 10)
    revenueByDay.push({ date: d, amount: revByDate.get(d) ?? 0 })
    bookingsByDay.push({ date: d, count: bkgByDate.get(d) ?? 0 })
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  // ── Top services (by booking count + revenue) ─────────────────────────────
  const serviceNameMap = new Map(services.map((s) => [s.id, s.name]))
  const bookingRevMap = new Map<string, number>()
  for (const p of periodPayments) {
    bookingRevMap.set(p.booking_id, (bookingRevMap.get(p.booking_id) ?? 0) + Number(p.amount))
  }
  const serviceStatsMap = new Map<string, { name: string; count: number; revenue: number }>()
  for (const b of activeInPeriod) {
    const sid = b.service_id
    if (!serviceStatsMap.has(sid)) {
      serviceStatsMap.set(sid, { name: serviceNameMap.get(sid) ?? '—', count: 0, revenue: 0 })
    }
    const stat = serviceStatsMap.get(sid)!
    stat.count++
    stat.revenue += bookingRevMap.get(b.id) ?? 0
  }
  const topServices = [...serviceStatsMap.values()].sort((a, b) => b.count - a.count).slice(0, 5)

  // ── Payment methods breakdown ─────────────────────────────────────────────
  const ptNameMap = new Map(paymentTypes.map((pt) => [pt.id, pt.name]))
  const pmStatsMap = new Map<string, { name: string; amount: number }>()
  for (const p of periodPayments) {
    const ptId = p.payment_type_id
    const name = ptNameMap.get(ptId) ?? '—'
    if (!pmStatsMap.has(ptId)) pmStatsMap.set(ptId, { name, amount: 0 })
    pmStatsMap.get(ptId)!.amount += Number(p.amount)
  }
  const paymentMethods = [...pmStatsMap.values()].sort((a, b) => b.amount - a.amount)

  // ── Booking sources breakdown ─────────────────────────────────────────────
  const srcMap = new Map<string, number>()
  for (const b of activeInPeriod) {
    const src = b.source || 'online'
    srcMap.set(src, (srcMap.get(src) ?? 0) + 1)
  }
  const bookingSources = [...srcMap.entries()].map(([source, count]) => ({ source, count }))

  // ── New vs repeat clients ─────────────────────────────────────────────────
  const priorClientSet = new Set(priorBookings.map((b) => b.client_id))
  const periodClientIds = new Set(activeInPeriod.map((b) => b.client_id))
  let newClients = 0
  let repeatClients = 0
  for (const cid of periodClientIds) {
    if (priorClientSet.has(cid)) repeatClients++
    else newClients++
  }

  return {
    // Legacy fields (used by dashboard/index.vue)
    totalRevenue,
    totalBookings,
    completedBookings,
    pendingBookings,
    todayBookings: todayBookingsCount,
    todayRevenue,
    monthRevenue,
    // Period-aware data
    periodRevenue,
    periodBookingsCount,
    avgCheck,
    newClients,
    repeatClients,
    revenueByDay,
    bookingsByDay,
    topServices,
    paymentMethods,
    bookingSources,
  }
})
