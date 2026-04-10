import type { H3Event } from 'h3'
import type { Database } from '~/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

type Profile = Database['public']['Tables']['profiles']['Row']

/** Requires auth and role === 'master'. Returns profile + authenticated supabase client. */
export async function requireMaster(
  event: H3Event,
): Promise<{ profile: Profile; supabase: SupabaseClient<Database> }> {
  const userId = requireAuth(event)
  const supabase = await useAuthenticatedSupabase(event)

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

  return { profile, supabase }
}
