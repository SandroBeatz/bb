import { clerkClient } from '@clerk/nuxt/server'

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event)

  const body = await readBody<{ role: string }>(event)

  if (!body?.role || !['master', 'client'].includes(body.role)) {
    throw createError({ statusCode: 400, message: 'Invalid role. Must be "master" or "client".' })
  }

  // Get user data directly from Clerk — no webhook needed
  const clerkUser = await clerkClient(event).users.getUser(userId)
  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ')
  const avatarUrl = clerkUser.imageUrl ?? null

  const supabase = useServerSupabase()

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      { id: userId, role: body.role, full_name: fullName, avatar_url: avatarUrl },
      { onConflict: 'id' },
    )
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
