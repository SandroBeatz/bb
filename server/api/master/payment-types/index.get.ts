export default defineEventHandler(async (event) => {
  const { profile: { id: masterId }, supabase } = await requireMaster(event)
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
