"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types/database"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    let isMounted = true
    const supabase = createClient()

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        
        if (isMounted) {
          setUser(session?.user ?? null)

          if (session?.user) {
            // Fetch user profile
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single()

            if (isMounted) {
              if (profileError) {
                console.warn("Error fetching profile:", profileError)
              } else {
                setProfile(profileData)
              }
            }
          }

          setLoading(false)
        }
      } catch (err) {
        console.error("Error in getInitialSession:", err)
        if (isMounted) {
          setError("Failed to load session")
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null)

        if (session?.user) {
          try {
            // Fetch user profile
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single()

            if (isMounted) {
              if (profileError) {
                console.warn("Error fetching profile:", profileError)
              } else {
                setProfile(profileData)
              }
            }
          } catch (err) {
            console.error("Error fetching profile:", err)
          }
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      if (typeof window !== 'undefined') {
        const supabase = createClient()
        await supabase.auth.signOut()
      }
    } catch (err) {
      console.error("Error signing out:", err)
      setError("Failed to sign out")
    }
  }

  return {
    user,
    profile,
    loading,
    error,
    signOut,
    isAuthenticated: !!user,
  }
}
