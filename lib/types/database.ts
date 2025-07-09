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
    }
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Country = Database["public"]["Tables"]["countries"]["Row"]
export type VisaEntry = Database["public"]["Tables"]["visa_entries"]["Row"]
export type TripCollection = Database["public"]["Tables"]["trip_collections"]["Row"]
