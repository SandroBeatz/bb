export default defineEventHandler(async (event) => {
  const userId = requireAuth(event)
  const supabase = useServerSupabase()

  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      master_id,
      starts_at,
      services(name),
      profiles!bookings_master_id_fkey(
        id,
        full_name,
        username,
        avatar_url,
        master_profiles(city, rating)
      )
    `,
    )
    .eq('client_id', userId)
    .order('starts_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  // Deduplicate by master_id keeping the most recent booking info
  const masterMap = new Map<
    string,
    {
      id: string
      full_name: string
      username: string | null
      avatar_url: string | null
      city: string | null
      rating: number | null
      lastVisitDate: string
      lastServiceName: string | null
      visitCount: number
    }
  >()

  for (const booking of data ?? []) {
    const p = booking.profiles as {
      id: string
      full_name: string
      username: string | null
      avatar_url: string | null
      master_profiles: { city: string | null; rating: number | null } | null
    } | null
    if (!p) continue

    const masterId = booking.master_id
    const existing = masterMap.get(masterId)
    if (!existing) {
      masterMap.set(masterId, {
        id: p.id,
        full_name: p.full_name,
        username: p.username,
        avatar_url: p.avatar_url,
        city: p.master_profiles?.city ?? null,
        rating: p.master_profiles?.rating ?? null,
        lastVisitDate: booking.starts_at,
        lastServiceName: (booking.services as { name: string } | null)?.name ?? null,
        visitCount: 1,
      })
    } else {
      existing.visitCount++
    }
  }

  return Array.from(masterMap.values())
})
