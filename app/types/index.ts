export type UserRole = 'master' | 'client' | 'admin'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type BookingSource = 'online' | 'offline' | 'telegram'
export type SubscriptionTier = 'free' | 'pro'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  username: string
  avatar_url: string | null
  telegram_id: string | null
  created_at: string
}

export interface MasterProfile {
  id: string
  bio: string | null
  city: string | null
  specializations: string[]
  contacts: Record<string, string>
  work_hours: Record<string, { start: string; end: string } | null>
  rating: number
  subscription_tier: SubscriptionTier
  subscription_ends_at: string | null
}

export interface Service {
  id: string
  master_id: string
  name: string
  description: string | null
  price: number
  duration_minutes: number
  is_active: boolean
}

export interface Booking {
  id: string
  master_id: string
  client_id: string
  service_id: string
  starts_at: string
  ends_at: string
  status: BookingStatus
  source: BookingSource
  notes: string | null
  created_at: string
}

export interface PaymentType {
  id: string
  master_id: string
  name: string
  is_active: boolean
  sort_order: number
}

export interface PaymentRecord {
  id: string
  booking_id: string
  master_id: string
  payment_type_id: string
  amount: number
  recorded_at: string
}

export interface PortfolioItem {
  id: string
  master_id: string
  image_url: string
  caption: string | null
  service_tag: string | null
  sort_order: number
  created_at: string
}

export interface Review {
  id: string
  booking_id: string
  master_id: string
  client_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface TimeSlot {
  start: string
  end: string
  available: boolean
}
