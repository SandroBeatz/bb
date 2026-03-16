export default defineEventHandler(async (event) => {
  const { id: masterId } = await requireMaster(event)

  const query = getQuery(event)
  const search = (query.search as string | undefined)?.toLowerCase()

  const supabase = useServerSupabase()

  // Get all clients for this master from the new clients table
  const { data: clientRows, error: clientsError } = await supabase
    .from('clients')
    .select('id, name, phone, notes, created_at')
    .eq('master_id', masterId)
    .order('created_at', { ascending: false })

  if (clientsError) {
    console.error('[clients] query error:', clientsError)
    throw createError({ statusCode: 500, message: clientsError.message })
  }

  if (!clientRows || clientRows.length === 0) return []

  const clientIds = clientRows.map((c) => c.id)

  // Booking stats per client
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, client_id, starts_at')
    .eq('master_id', masterId)
    .neq('status', 'cancelled')
    .in('client_id', clientIds)

  const bookingIds = (bookings ?? []).map((b) => b.id)

  // Payment totals
  const paymentMap = new Map<string, number>()
  if (bookingIds.length > 0) {
    const { data: payments } = await supabase
      .from('payment_records')
      .select('booking_id, amount')
      .in('booking_id', bookingIds)

    for (const p of payments ?? []) {
      paymentMap.set(p.booking_id, (paymentMap.get(p.booking_id) ?? 0) + Number(p.amount))
    }
  }

  type Stats = { visit_count: number; last_visit: string | null; total_amount: number }
  const statsMap = new Map<string, Stats>()

  for (const b of bookings ?? []) {
    if (!statsMap.has(b.client_id)) {
      statsMap.set(b.client_id, { visit_count: 0, last_visit: null, total_amount: 0 })
    }
    const s = statsMap.get(b.client_id)!
    s.visit_count++
    if (!s.last_visit || b.starts_at > s.last_visit) s.last_visit = b.starts_at
    s.total_amount += paymentMap.get(b.id) ?? 0
  }

  let clients = clientRows.map((client) => {
    const stats = statsMap.get(client.id)
    return {
      id: client.id,
      name: client.name,
      phone: client.phone,
      notes: client.notes,
      created_at: client.created_at,
      visit_count: stats?.visit_count ?? 0,
      last_visit: stats?.last_visit ?? null,
      total_amount: stats?.total_amount ?? 0,
    }
  })

  if (search) {
    clients = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.phone.toLowerCase().includes(search),
    )
  }

  // Sort by last visit desc, then by created_at desc
  clients.sort((a, b) => {
    if (a.last_visit && b.last_visit) return b.last_visit.localeCompare(a.last_visit)
    if (a.last_visit) return -1
    if (b.last_visit) return 1
    return b.created_at.localeCompare(a.created_at)
  })

  return clients
})
