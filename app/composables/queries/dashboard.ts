import { defineQueryOptions } from '@pinia/colada'
import type { BookingWithDetails, ClientItem, DashboardAnalytics, ProfileData } from '~/stores/dashboardCache'
import type { PaymentType } from '~/types'
import type { Database } from '~/types/database.types'

type Service = Database['public']['Tables']['services']['Row']

export const bookingsQuery = defineQueryOptions({
  key: ['master', 'bookings'],
  query: () => $fetch<BookingWithDetails[]>('/api/master/bookings'),
  staleTime: 0, // бронирования всегда обновляем при фокусе
})

export const analyticsQuery = defineQueryOptions({
  key: ['master', 'analytics'],
  query: () => $fetch<DashboardAnalytics>('/api/master/analytics'),
})

export const servicesQuery = defineQueryOptions({
  key: ['master', 'services'],
  query: () => $fetch<Service[]>('/api/master/services'),
  staleTime: 60_000, // услуги меняются редко
})

export const clientsQuery = defineQueryOptions({
  key: ['master', 'clients'],
  query: () => $fetch<ClientItem[]>('/api/master/clients'),
})

export const masterProfileQuery = defineQueryOptions({
  key: ['master', 'profile'],
  query: () => $fetch<ProfileData>('/api/master/profile'),
})

export const paymentTypesQuery = defineQueryOptions({
  key: ['master', 'payment-types'],
  query: () => $fetch<PaymentType[]>('/api/master/payment-types'),
  staleTime: 300_000, // типы оплаты меняются очень редко
})
