export default defineEventHandler(async (event) => {
  const userId = requireAuth(event)

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select('*, master_profiles(*)')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
