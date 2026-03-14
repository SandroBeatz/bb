import type { H3Event } from 'h3'
import type { Database } from '~/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

/** Requires auth and role === 'master'. Returns the master's profile or throws 401/403. */
export async function requireMaster(event: H3Event): Promise<Profile> {
  const userId = requireAuth(event)

  const supabase = useServerSupabase()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    throw createError({ statusCode: 403, message: 'Master profile not found' })
  }

  if (profile.role !== 'master') {
    throw createError({
      statusCode: 403,
      message: 'Access denied: master role required',
    })
  }

  return profile
}
