/**
 * Supabase profile as the single source of truth for user data.
 * Clerk is used only for authentication; name/avatar come from Supabase.
 */

interface ProfileUpdate {
  full_name?: string
  username?: string
  avatar_url?: string | null
  telegram_id?: string | null
  phone?: string | null
  email?: string | null
}

const profile = ref<{
  id: string
  role: string
  full_name: string
  username: string | null
  avatar_url: string | null
  telegram_id: string | null
  phone: string | null
  email: string | null
  created_at: string
} | null>(null)

const pending = ref(false)

export function useProfile() {
  const { isSignedIn } = useAuth()

  async function fetch() {
    if (!isSignedIn.value) return
    pending.value = true
    try {
      profile.value = await $fetch('/api/me/profile')
    } catch {
      // Profile may not exist yet (pre-onboarding) — silently ignore
      profile.value = null
    } finally {
      pending.value = false
    }
  }

  async function update(data: ProfileUpdate) {
    const updated = await $fetch('/api/me/profile', {
      method: 'PATCH',
      body: data,
    })
    profile.value = updated as typeof profile.value
    return updated
  }

  return {
    profile: readonly(profile),
    pending: readonly(pending),
    fetch,
    update,
  }
}
