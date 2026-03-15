export default defineEventHandler(async (event) => {
  const itemId = getRouterParam(event, 'id')
  const { id: masterId } = await requireMaster(event)

  if (!itemId) {
    throw createError({ statusCode: 400, message: 'Portfolio item ID is required' })
  }

  const body = await readBody<{
    caption?: string | null
    service_tag?: string | null
    sort_order?: number
  }>(event)

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('portfolio_items')
    .update({
      ...(body.caption !== undefined && { caption: body.caption }),
      ...(body.service_tag !== undefined && { service_tag: body.service_tag }),
      ...(body.sort_order !== undefined && { sort_order: body.sort_order }),
    })
    .eq('id', itemId)
    .eq('master_id', masterId)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
