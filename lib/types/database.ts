export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          country_code: string | null
          home_country: string | null
          travel_reason: string | null
          profile_completed: boolean | null
          is_admin: boolean | null
          analytics_consent: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          country_code?: string | null
          home_country?: string | null
          travel_reason?: string | null
          profile_completed?: boolean | null
          is_admin?: boolean | null
          analytics_consent?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          country_code?: string | null
          home_country?: string | null
          travel_reason?: string | null
          profile_completed?: boolean | null
          is_admin?: boolean | null
          analytics_consent?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      countries: {
        Row: {
          code: string
          name: string
          flag: string
          is_schengen: boolean | null
          created_at: string
        }
        Insert: {
          code: string
          name: string
          flag: string
          is_schengen?: boolean | null
          created_at?: string
        }
        Update: {
          code?: string
          name?: string
          flag?: string
          is_schengen?: boolean | null
          created_at?: string
        }
      }
      visa_entries: {
        Row: {
          id: string
          user_id: string
          country_code: string
          start_date: string
          end_date: string
          days: number | null
          notes: string | null
          trip_collection_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          country_code: string
          start_date: string
          end_date: string
          notes?: string | null
          trip_collection_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          country_code?: string
          start_date?: string
          end_date?: string
          notes?: string | null
          trip_collection_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trip_collections: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          event_type: string
          country_code: string | null
          home_country: string | null
          trip_duration_days: number | null
          days_remaining: number | null
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          country_code?: string | null
          home_country?: string | null
          trip_duration_days?: number | null
          days_remaining?: number | null
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          country_code?: string | null
          home_country?: string | null
          trip_duration_days?: number | null
          days_remaining?: number | null
          session_id?: string | null
          created_at?: string
        }
      }
      analytics_daily_summary: {
        Row: {
          id: string
          date: string
          total_calculations: number | null
          total_signups: number | null
          unique_sessions: number | null
          popular_destinations: any | null
          home_country_breakdown: any | null
          avg_trip_duration: number | null
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          total_calculations?: number | null
          total_signups?: number | null
          unique_sessions?: number | null
          popular_destinations?: any | null
          home_country_breakdown?: any | null
          avg_trip_duration?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          total_calculations?: number | null
          total_signups?: number | null
          unique_sessions?: number | null
          popular_destinations?: any | null
          home_country_breakdown?: any | null
          avg_trip_duration?: number | null
          created_at?: string
        }
      }
    }
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Country = Database["public"]["Tables"]["countries"]["Row"]
export type VisaEntry = Database["public"]["Tables"]["visa_entries"]["Row"]
export type TripCollection = Database["public"]["Tables"]["trip_collections"]["Row"]
export type AnalyticsEvent = Database["public"]["Tables"]["analytics_events"]["Row"]
export type AnalyticsDailySummary = Database["public"]["Tables"]["analytics_daily_summary"]["Row"]
