import { defineQueryOptions, useMutation, useQuery, useQueryCache } from '@pinia/colada'

/**
 * Supabase profile as the single source of truth for user data.
 * Clerk is used only for authentication; name/avatar come from Supabase.
 */

interface ProfileData {
  id: string
  role: string
  full_name: string
  username: string | null
  avatar_url: string | null
  telegram_id: string | null
  phone: string | null
  email: string | null
  created_at: string
}

interface ProfileUpdate {
  full_name?: string
  username?: string
  avatar_url?: string | null
  telegram_id?: string | null
  phone?: string | null
  email?: string | null
}

export const profileQuery = defineQueryOptions({
  key: ['me', 'profile'],
  // Profile may not exist yet (pre-onboarding) — return null instead of throwing
  query: () => $fetch<ProfileData>('/api/me/profile').catch(() => null),
})

export function useProfile() {
  const { isSignedIn } = useAuth()
  const queryCache = useQueryCache()

  const { data: profile, asyncStatus } = useQuery({
    ...profileQuery,
    // Только клиент: Clerk не форвардит сессию при SSR → 401
    enabled: () => import.meta.client && !!isSignedIn.value,
  })

  const { mutateAsync: update } = useMutation({
    mutation: (data: ProfileUpdate) =>
      $fetch<ProfileData>('/api/me/profile', { method: 'PATCH', body: data }),
    onSuccess: (updated) => {
      queryCache.setQueryData(profileQuery.key, updated)
    },
  })

  return {
    profile: readonly(profile),
    pending: computed(() => asyncStatus.value === 'loading'),
    // fetch оставляем для обратной совместимости с app.vue и других мест
    fetch: () => queryCache.refresh(queryCache.ensure(profileQuery)),
    update,
  }
}
