export default defineEventHandler(async (event) => {
  const { id: masterId } = await requireMaster(event)

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
