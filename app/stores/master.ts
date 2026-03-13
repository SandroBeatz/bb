import { defineStore } from 'pinia'
import type { MasterProfile, Service, Booking } from '~/types'

export const useMasterStore = defineStore('master', () => {
  const profile = ref<MasterProfile | null>(null)
  const services = ref<Service[]>([])
  const bookings = ref<Booking[]>([])

  const supabase = useSupabaseClient()

  async function fetchProfile(masterId: string) {
    const { data } = await supabase
      .from('master_profiles')
      .select('*')
      .eq('id', masterId)
      .single()
    profile.value = data
  }

  async function fetchServices(masterId: string) {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('master_id', masterId)
      .eq('is_active', true)
    services.value = data ?? []
  }

  async function fetchBookings(masterId: string) {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('master_id', masterId)
      .order('starts_at', { ascending: false })
    bookings.value = data ?? []
  }

  return { profile, services, bookings, fetchProfile, fetchServices, fetchBookings }
})
