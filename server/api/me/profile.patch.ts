export default defineEventHandler(async (event) => {
  const userId = requireAuth(event)

  const body = await readBody<Record<string, unknown>>(event)

  const allowed = ['full_name', 'username', 'avatar_url', 'telegram_id', 'phone', 'email']
  const sanitized = Object.fromEntries(
    Object.entries(body).filter(([key]) => allowed.includes(key)),
  )

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .update(sanitized)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
