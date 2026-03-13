export default defineEventHandler(async (event) => {
  const masterId = requireAuth(event)

  const body = await readBody<{ name: string; sort_order?: number }>(event)

  if (!body?.name) {
    throw createError({ statusCode: 400, message: 'name is required' })
  }

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('payment_types')
    .insert({
      master_id: masterId,
      name: body.name,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
