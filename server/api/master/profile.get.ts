export default defineEventHandler(async (event) => {
  const profile = await requireMaster(event)

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select('*, master_profiles(*)')
    .eq('id', profile.id)
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
