export default defineEventHandler(async (event) => {
  const { id: masterId } = await requireMaster(event)

  const query = getQuery(event)
  const search = (query.search as string | undefined)?.toLowerCase()

  const supabase = useServerSupabase()

  // Get all clients linked to this master
  const { data: links, error: linksError } = await supabase
    .from('master_clients')
    .select('client_id, display_name, notes, invitation_status, created_at')
    .eq('master_id', masterId)

  if (linksError) {
    console.error('[clients] master_clients query error:', linksError)
    throw createError({ statusCode: 500, message: linksError.message })
  }

  if (!links || links.length === 0) return []

  const clientIds = links.map((l) => l.client_id)

  // Fetch profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, phone, email')
    .in('id', clientIds)

  if (profilesError) {
    console.error('[clients] profiles query error:', profilesError)
    throw createError({ statusCode: 500, message: profilesError.message })
  }

  const profileMap = new Map<string, (typeof profiles)[number]>()
  for (const p of profiles ?? []) {
    profileMap.set(p.id, p)
  }

  // Aggregate booking stats (no JOINs to avoid PostgREST issues)
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, client_id, starts_at')
    .eq('master_id', masterId)
    .neq('status', 'cancelled')
    .in('client_id', clientIds)

  const bookingIds = (bookings ?? []).map((b) => b.id)

  // Fetch payment totals separately
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

  // Build response
  let clients = links.map((link) => {
    const profile = profileMap.get(link.client_id)
    const stats = statsMap.get(link.client_id)
    return {
      id: link.client_id,
      full_name: link.display_name || profile?.full_name || '',
      avatar_url: profile?.avatar_url ?? null,
      phone: profile?.phone ?? null,
      email: profile?.email ?? null,
      display_name: link.display_name,
      notes: link.notes,
      invitation_status: link.invitation_status,
      added_at: link.created_at,
      visit_count: stats?.visit_count ?? 0,
      last_visit: stats?.last_visit ?? null,
      total_amount: stats?.total_amount ?? 0,
    }
  })

  if (search) {
    clients = clients.filter(
      (c) =>
        c.full_name.toLowerCase().includes(search) ||
        (c.phone && c.phone.includes(search)) ||
        (c.email && c.email.toLowerCase().includes(search)),
    )
  }

  clients.sort((a, b) => {
    if (!a.last_visit && !b.last_visit) return 0
    if (!a.last_visit) return 1
    if (!b.last_visit) return -1
    return b.last_visit.localeCompare(a.last_visit)
  })

  return clients
})
