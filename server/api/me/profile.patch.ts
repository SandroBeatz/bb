export default defineEventHandler(async (event) => {
  const { userId } = useAuth()

  if (!userId?.value) {
    throw createError({ statusCode: 401, message: 'Authentication required' })
  }

  const body = await readBody<Partial<{
    full_name: string
    username: string
    avatar_url: string | null
    telegram_id: string | null
  }>>(event)

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .update(body)
    .eq('id', userId.value)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
