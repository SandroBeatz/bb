export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: string
          full_name: string
          username: string | null
          avatar_url: string | null
          telegram_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          role?: string
          full_name?: string
          username?: string | null
          avatar_url?: string | null
          telegram_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: string
          full_name?: string
          username?: string | null
          avatar_url?: string | null
          telegram_id?: string | null
          created_at?: string
        }
      }
      master_profiles: {
        Row: {
          id: string
          bio: string | null
          city: string | null
          specializations: string[]
          contacts: Json
          work_hours: Json
          rating: number
          subscription_tier: string
          subscription_ends_at: string | null
        }
        Insert: {
          id: string
          bio?: string | null
          city?: string | null
          specializations?: string[]
          contacts?: Json
          work_hours?: Json
          rating?: number
          subscription_tier?: string
          subscription_ends_at?: string | null
        }
        Update: {
          id?: string
          bio?: string | null
          city?: string | null
          specializations?: string[]
          contacts?: Json
          work_hours?: Json
          rating?: number
          subscription_tier?: string
          subscription_ends_at?: string | null
        }
      }
      services: {
        Row: {
          id: string
          master_id: string
          name: string
          description: string | null
          price: number
          duration_minutes: number
          is_active: boolean
        }
        Insert: {
          id?: string
          master_id: string
          name: string
          description?: string | null
          price?: number
          duration_minutes?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          master_id?: string
          name?: string
          description?: string | null
          price?: number
          duration_minutes?: number
          is_active?: boolean
        }
      }
      bookings: {
        Row: {
          id: string
          master_id: string
          client_id: string
          service_id: string
          starts_at: string
          ends_at: string
          status: string
          source: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          master_id: string
          client_id: string
          service_id: string
          starts_at: string
          ends_at: string
          status?: string
          source?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          master_id?: string
          client_id?: string
          service_id?: string
          starts_at?: string
          ends_at?: string
          status?: string
          source?: string
          notes?: string | null
          created_at?: string
        }
      }
      payment_types: {
        Row: {
          id: string
          master_id: string
          name: string
          is_active: boolean
          sort_order: number
        }
        Insert: {
          id?: string
          master_id: string
          name: string
          is_active?: boolean
          sort_order?: number
        }
        Update: {
          id?: string
          master_id?: string
          name?: string
          is_active?: boolean
          sort_order?: number
        }
      }
      payment_records: {
        Row: {
          id: string
          booking_id: string
          master_id: string
          payment_type_id: string
          amount: number
          recorded_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          master_id: string
          payment_type_id: string
          amount?: number
          recorded_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          master_id?: string
          payment_type_id?: string
          amount?: number
          recorded_at?: string
        }
      }
      portfolio_items: {
        Row: {
          id: string
          master_id: string
          image_url: string
          caption: string | null
          service_tag: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          master_id: string
          image_url: string
          caption?: string | null
          service_tag?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          master_id?: string
          image_url?: string
          caption?: string | null
          service_tag?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          master_id: string
          client_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          master_id: string
          client_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          master_id?: string
          client_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
    }
  }
}
