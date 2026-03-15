export default defineEventHandler(async (event) => {
  const supabase = useServerSupabase()
  const q = getQuery(event)

  const search = q.search as string | undefined
  const category = q.category as string | undefined
  const city = q.city as string | undefined
  const minRating = q.minRating ? Number(q.minRating) : undefined
  const minPrice = q.minPrice ? Number(q.minPrice) : undefined
  const maxPrice = q.maxPrice ? Number(q.maxPrice) : undefined
  const sort = (q.sort as string | undefined) ?? 'date'
  const page = q.page ? Math.max(1, Number(q.page)) : 1
  const limit = q.limit ? Math.min(100, Math.max(1, Number(q.limit))) : 20

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      username,
      avatar_url,
      created_at,
      master_profiles (
        bio,
        city,
        specializations,
        rating,
        subscription_tier
      ),
      services (
        price,
        is_active
      )
    `)
    .eq('role', 'master')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  // Compute priceFrom for each master
  let result = (data ?? []).map((m) => {
    const activePrices = (m.services ?? [])
      .filter((s) => s.is_active)
      .map((s) => s.price)
    const priceFrom = activePrices.length > 0 ? Math.min(...activePrices) : null
    return {
      id: m.id,
      full_name: m.full_name,
      username: m.username,
      avatar_url: m.avatar_url,
      master_profiles: m.master_profiles,
      priceFrom,
    }
  })

  // Apply filters
  if (search) {
    const sq = search.toLowerCase()
    result = result.filter((m) => m.full_name?.toLowerCase().includes(sq))
  }

  if (city) {
    const cq = city.toLowerCase()
    result = result.filter((m) => m.master_profiles?.[0]?.city?.toLowerCase().includes(cq))
  }

  if (minRating !== undefined) {
    result = result.filter((m) => {
      const r = m.master_profiles?.[0]?.rating
      return r !== null && r !== undefined && r >= minRating
    })
  }

  if (category) {
    const cq = category.toLowerCase()
    result = result.filter((m) =>
      m.master_profiles?.[0]?.specializations?.some((s) => s.toLowerCase().includes(cq)),
    )
  }

  if (minPrice !== undefined) {
    result = result.filter((m) => m.priceFrom !== null && m.priceFrom >= minPrice)
  }

  if (maxPrice !== undefined) {
    result = result.filter((m) => m.priceFrom !== null && m.priceFrom <= maxPrice)
  }

  // Sort
  if (sort === 'rating') {
    result.sort((a, b) => {
      const rA = a.master_profiles?.[0]?.rating ?? 0
      const rB = b.master_profiles?.[0]?.rating ?? 0
      return rB - rA
    })
  } else if (sort === 'price') {
    result.sort(
      (a, b) =>
        (a.priceFrom ?? Number.POSITIVE_INFINITY) - (b.priceFrom ?? Number.POSITIVE_INFINITY),
    )
  }
  // Default 'date' sort is already applied by the DB query (.order('created_at', ascending: false))

  // Paginate
  const total = result.length
  const from = (page - 1) * limit
  const paginatedData = result.slice(from, from + limit)

  return { data: paginatedData, total, page, limit }
})
