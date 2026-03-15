const PAGE_LIMIT = 10

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username')

  if (!username) {
    throw createError({ statusCode: 400, message: 'Username is required' })
  }

  const { limit: limitParam, offset: offsetParam } = getQuery(event)
  const limit = Math.min(Number(limitParam) || PAGE_LIMIT, 50)
  const offset = Math.max(Number(offsetParam) || 0, 0)

  const supabase = useServerSupabase()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .eq('role', 'master')
    .single()

  if (profileError || !profile) {
    throw createError({ statusCode: 404, message: 'Master not found' })
  }

  const { data, error, count } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, client:client_id(full_name, avatar_url)', {
      count: 'exact',
    })
    .eq('master_id', profile.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return {
    data: data ?? [],
    hasMore: (count ?? 0) > offset + (data ?? []).length,
    total: count ?? 0,
  }
})
