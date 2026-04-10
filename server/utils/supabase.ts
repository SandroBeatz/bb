import { createClient } from '@supabase/supabase-js'
import { clerkClient } from '@clerk/nuxt/server'
import type { H3Event } from 'h3'

/** Anon client — for public reads (no auth required) */
export function useServerSupabase() {
  const config = useRuntimeConfig()
  return createClient(config.public.supabaseUrl, config.public.supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/** Authenticated client using the caller's Clerk JWT — for all writes and user-specific reads */
export async function useAuthenticatedSupabase(event: H3Event) {
  const auth = event.context.auth?.()
  if (!auth?.sessionId) {
    throw createError({ statusCode: 401, message: 'Authentication required' })
  }
  const { jwt } = await clerkClient(event).sessions.getToken(auth.sessionId, 'supabase')
  const config = useRuntimeConfig()
  return createClient(config.public.supabaseUrl, config.public.supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  })
}
