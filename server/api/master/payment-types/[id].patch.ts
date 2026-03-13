export default defineEventHandler(async (event) => {
  const paymentTypeId = getRouterParam(event, 'id')
  const { userId } = useAuth()
  const masterId = userId?.value

  if (!masterId) {
    throw createError({ statusCode: 401, message: 'Authentication required' })
  }

  if (!paymentTypeId) {
    throw createError({ statusCode: 400, message: 'Payment type ID is required' })
  }

  const body = await readBody<Partial<{
    name: string
    is_active: boolean
    sort_order: number
  }>>(event)

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('payment_types')
    .update(body)
    .eq('id', paymentTypeId)
    .eq('master_id', masterId)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
