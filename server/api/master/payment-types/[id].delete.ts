export default defineEventHandler(async (event) => {
  const paymentTypeId = getRouterParam(event, 'id')
  const { id: masterId } = await requireMaster(event)

  if (!paymentTypeId) {
    throw createError({
      statusCode: 400,
      message: 'Payment type ID is required',
    })
  }

  const supabase = useServerSupabase()
  const { error } = await supabase
    .from('payment_types')
    .delete()
    .eq('id', paymentTypeId)
    .eq('master_id', masterId)

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { success: true }
})
