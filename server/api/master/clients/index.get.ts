export default defineEventHandler(async (event) => {
  const { id: masterId } = await requireMaster(event)

  const query = getQuery(event)
  const search = (query.search as string | undefined)?.toLowerCase()

  const supabase = useServerSupabase()

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(
      'id, client_id, starts_at, status, services(name), profiles!client_id(full_name, avatar_url), payment_records(amount)',
    )
    .eq('master_id', masterId)
    .neq('status', 'cancelled')

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  type ClientEntry = {
    id: string
    full_name: string
    avatar_url: string | null
    visit_count: number
    last_visit: string | null
    total_amount: number
  }

  const clientMap = new Map<string, ClientEntry>()

  for (const booking of bookings ?? []) {
    const clientId = booking.client_id
    const profile = booking.profiles as { full_name: string; avatar_url: string | null } | null

    if (!clientId || !profile) continue

    if (!clientMap.has(clientId)) {
      clientMap.set(clientId, {
        id: clientId,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        visit_count: 0,
        last_visit: null,
        total_amount: 0,
      })
    }

    const client = clientMap.get(clientId)!
    client.visit_count++

    if (!client.last_visit || booking.starts_at > client.last_visit) {
      client.last_visit = booking.starts_at
    }

    const payments = booking.payment_records as { amount: number }[] | null
    if (payments) {
      for (const p of payments) {
        client.total_amount += Number(p.amount)
      }
    }
  }

  let clients = Array.from(clientMap.values())

  if (search) {
    clients = clients.filter((c) => c.full_name.toLowerCase().includes(search))
  }

  clients.sort((a, b) => {
    if (!a.last_visit) return 1
    if (!b.last_visit) return -1
    return b.last_visit.localeCompare(a.last_visit)
  })

  return clients
})
