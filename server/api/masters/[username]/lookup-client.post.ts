export default defineEventHandler(async (event) => {
  const masterId = getRouterParam(event, 'username')

  if (!masterId) {
    throw createError({ statusCode: 400, message: 'Master ID is required' })
  }

  const body = await readBody<{ phone: string }>(event)

  if (!body?.phone) {
    throw createError({ statusCode: 400, message: 'phone is required' })
  }

  const supabase = useServerSupabase()
  const phone = body.phone.replace(/\s/g, '')

  const { data: client } = await supabase
    .from('clients')
    .select('id, name')
    .eq('master_id', masterId)
    .eq('phone', phone)
    .single()

  if (client) {
    return { found: true, name: client.name, id: client.id }
  }

  return { found: false }
})
