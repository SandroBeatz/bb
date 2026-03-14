export default defineEventHandler(async (event) => {
  const { id: masterId } = await requireMaster(event)

  const body = await readBody<{
    name: string
    description?: string
    price: number
    duration_minutes: number
  }>(event)

  if (!body?.name || body?.price == null || !body?.duration_minutes) {
    throw createError({
      statusCode: 400,
      message: 'name, price and duration_minutes are required',
    })
  }

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('services')
    .insert({
      master_id: masterId,
      name: body.name,
      description: body.description ?? null,
      price: body.price,
      duration_minutes: body.duration_minutes,
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
