import { clerkClient } from '@clerk/nuxt/server'

interface OnboardingBody {
  full_name?: string
  username?: string
  avatar_url?: string | null
  specializations?: string[]
  work_hours?: Record<string, { start: string; end: string; off: boolean }>
}

export default defineEventHandler(async (event) => {
  const userId = requireAuth(event)

  const body = await readBody<OnboardingBody>(event)

  // Validate username format if provided
  if (body.username && !/^[a-z0-9_-]{3,}$/.test(body.username)) {
    throw createError({ statusCode: 400, message: 'Invalid username format' })
  }

  // Get user data from Clerk to fill defaults
  const clerkUser = await clerkClient(event).users.getUser(userId)
  const fullName =
    body.full_name?.trim() || [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ')
  const avatarUrl = body.avatar_url !== undefined ? body.avatar_url : (clerkUser.imageUrl ?? null)

  const supabase = useServerSupabase()

  // Upsert profile with role=master (all new users become masters)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        role: 'master',
        full_name: fullName,
        username: body.username ?? null,
        avatar_url: avatarUrl,
      },
      { onConflict: 'id' },
    )
    .select()
    .single()

  if (profileError) {
    if (profileError.code === '23505') {
      throw createError({ statusCode: 409, message: 'Username already taken' })
    }
    throw createError({ statusCode: 500, message: profileError.message })
  }

  // Upsert master_profiles with specializations + work hours
  const { error: masterError } = await supabase.from('master_profiles').upsert(
    {
      id: userId,
      specializations: body.specializations ?? [],
      work_hours: body.work_hours ?? {},
    },
    { onConflict: 'id' },
  )

  if (masterError) {
    throw createError({ statusCode: 500, message: masterError.message })
  }

  return profile
})
