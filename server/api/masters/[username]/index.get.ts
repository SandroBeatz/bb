export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username')

  if (!username) {
    throw createError({ statusCode: 400, message: 'Username is required' })
  }

  const supabase = useServerSupabase()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      username,
      avatar_url,
      master_profiles (
        bio,
        city,
        specializations,
        contacts,
        work_hours,
        rating,
        subscription_tier
      )
    `)
    .eq('username', username)
    .eq('role', 'master')
    .single()

  if (error) {
    throw createError({ statusCode: 404, message: 'Master not found' })
  }

  return data
})
