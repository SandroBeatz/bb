export default defineEventHandler(async (event) => {
  const serviceId = getRouterParam(event, 'id')
  const masterId = requireAuth(event)

  if (!serviceId) {
    throw createError({ statusCode: 400, message: 'Service ID is required' })
  }

  const body = await readBody<Partial<{
    name: string
    description: string | null
    price: number
    duration_minutes: number
    is_active: boolean
  }>>(event)

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('services')
    .update(body)
    .eq('id', serviceId)
    .eq('master_id', masterId)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
