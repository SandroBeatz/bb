export default defineEventHandler(async (event) => {
  const serviceId = getRouterParam(event, 'id')
  const { id: masterId } = await requireMaster(event)

  if (!serviceId) {
    throw createError({ statusCode: 400, message: 'Service ID is required' })
  }

  const supabase = useServerSupabase()
  const { error } = await supabase
    .from('services')
    .update({ is_active: false })
    .eq('id', serviceId)
    .eq('master_id', masterId)

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { success: true }
})
