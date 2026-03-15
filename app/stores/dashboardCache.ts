import { defineStore } from 'pinia'
import type { Booking } from '~/types'
import type { Database } from '~/types/database.types'

type Service = Database['public']['Tables']['services']['Row']

export type BookingWithDetails = Booking & {
  services?: { name: string; price: number; duration_minutes: number } | null
  profiles?: { full_name: string; avatar_url: string | null } | null
}

export type DashboardAnalytics = {
  totalRevenue: number
  totalBookings: number
  completedBookings: number
  pendingBookings: number
  todayBookings: number
  todayRevenue: number
  monthRevenue: number
}

export type ClientItem = {
  id: string
  full_name: string
  avatar_url: string | null
  phone: string | null
  email: string | null
  display_name: string | null
  notes: string | null
  invitation_status: string
  added_at: string
  visit_count: number
  last_visit: string | null
  total_amount: number
}

type WorkDay = { start: string; end: string }

export type ProfileData = {
  full_name: string
  username: string | null
  avatar_url: string | null
  master_profiles: {
    bio: string | null
    city: string | null
    specializations: string[]
    contacts: Record<string, string>
    work_hours: Record<string, WorkDay | null>
  } | null
}

export const useDashboardCache = defineStore('dashboardCache', () => {
  // ── Bookings ──────────────────────────────────────────────────────────────
  const bookings = ref<BookingWithDetails[]>([])
  const bookingsLoading = ref(false)
  const bookingsReady = ref(false)

  async function fetchBookings() {
    bookingsLoading.value = true
    try {
      bookings.value = (await $fetch<BookingWithDetails[]>('/api/master/bookings')) ?? []
      bookingsReady.value = true
    } catch {
      bookingsReady.value = true
    } finally {
      bookingsLoading.value = false
    }
  }

  // ── Analytics ─────────────────────────────────────────────────────────────
  const analytics = ref<DashboardAnalytics | null>(null)
  const analyticsLoading = ref(false)
  const analyticsReady = ref(false)

  async function fetchAnalytics() {
    analyticsLoading.value = true
    try {
      analytics.value = await $fetch<DashboardAnalytics>('/api/master/analytics')
      analyticsReady.value = true
    } catch {
      analyticsReady.value = true
    } finally {
      analyticsLoading.value = false
    }
  }

  // ── Services ──────────────────────────────────────────────────────────────
  const services = ref<Service[]>([])
  const servicesLoading = ref(false)
  const servicesReady = ref(false)

  async function fetchServices() {
    servicesLoading.value = true
    try {
      services.value = (await $fetch<Service[]>('/api/master/services')) ?? []
      servicesReady.value = true
    } catch {
      servicesReady.value = true
    } finally {
      servicesLoading.value = false
    }
  }

  // ── Clients ───────────────────────────────────────────────────────────────
  const clients = ref<ClientItem[]>([])
  const clientsLoading = ref(false)
  const clientsReady = ref(false)

  async function fetchClients() {
    clientsLoading.value = true
    try {
      clients.value = (await $fetch<ClientItem[]>('/api/master/clients')) ?? []
      clientsReady.value = true
    } catch {
      clientsReady.value = true
    } finally {
      clientsLoading.value = false
    }
  }

  // ── Profile (settings) ────────────────────────────────────────────────────
  const profileData = ref<ProfileData | null>(null)
  const profileLoading = ref(false)

  async function fetchProfile() {
    profileLoading.value = true
    try {
      profileData.value = await $fetch<ProfileData>('/api/master/profile')
    } catch {
      //
    } finally {
      profileLoading.value = false
    }
  }

  return {
    bookings,
    bookingsLoading,
    bookingsReady,
    fetchBookings,
    analytics,
    analyticsLoading,
    analyticsReady,
    fetchAnalytics,
    services,
    servicesLoading,
    servicesReady,
    fetchServices,
    clients,
    clientsLoading,
    clientsReady,
    fetchClients,
    profileData,
    profileLoading,
    fetchProfile,
  }
})
