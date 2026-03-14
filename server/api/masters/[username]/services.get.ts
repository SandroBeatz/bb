export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username')

  if (!username) {
    throw createError({ statusCode: 400, message: 'Username is required' })
  }

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

  const { data, error } = await supabase
    .from('services')
    .select('id, name, description, price, duration_minutes')
    .eq('master_id', profile.id)
    .eq('is_active', true)
    .order('price', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data ?? []
})
