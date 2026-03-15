export default defineEventHandler(async (event) => {
  const { id: masterId } = await requireMaster(event)

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('id, image_url, caption, service_tag, sort_order, created_at')
    .eq('master_id', masterId)
    .order('sort_order', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data ?? []
})
