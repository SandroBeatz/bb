export default defineEventHandler(async () => {
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
        rating,
        subscription_tier
      )
    `)
    .eq('role', 'master')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
