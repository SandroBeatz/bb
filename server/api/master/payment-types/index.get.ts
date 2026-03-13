export default defineEventHandler(async (event) => {
  const { userId } = useAuth()
  const masterId = userId?.value

  if (!masterId) {
    throw createError({ statusCode: 401, message: 'Authentication required' })
  }

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('payment_types')
    .select('*')
    .eq('master_id', masterId)
    .order('sort_order')

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
