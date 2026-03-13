export default defineEventHandler(async (event) => {
  const masterId = requireAuth(event)

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('master_id', masterId)
    .order('name')

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
