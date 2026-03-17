import { defineQueryOptions, useQuery } from '@pinia/colada'
import type { ProfileData } from '~/stores/dashboardCache'
import type { Database } from '~/types/database.types'

type PaymentType = Database['public']['Tables']['payment_types']['Row']

// ── Query definitions ─────────────────────────────────────────────────────────

export const masterProfileQuery = defineQueryOptions({
  key: ['master', 'profile'],
  query: () => $fetch<ProfileData>('/api/master/profile'),
})

export const paymentTypesQuery = defineQueryOptions({
  key: ['master', 'payment-types'],
  query: () => $fetch<PaymentType[]>('/api/master/payment-types'),
  staleTime: 60_000,
})

// ── Auth-aware wrappers ───────────────────────────────────────────────────────
// Dashboard endpoints require auth. All queries are gated on isSignedIn
// to prevent SSR 401 errors (Clerk doesn't forward the session during SSR).

export function useMasterProfileQuery() {
  const { isSignedIn } = useAuth()
  return useQuery({
    ...masterProfileQuery,
    enabled: () => import.meta.client && !!isSignedIn.value,
  })
}

export function usePaymentTypesQuery() {
  const { isSignedIn } = useAuth()
  return useQuery({
    ...paymentTypesQuery,
    enabled: () => import.meta.client && !!isSignedIn.value,
  })
}
