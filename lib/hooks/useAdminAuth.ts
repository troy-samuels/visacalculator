"use client"

import { useEffect, useState } from "react"
import { useAuth } from "./useAuth"

export function useAdminAuth() {
  const { user, profile, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (profile?.is_admin) {
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    }
  }, [profile, authLoading])

  return {
    user,
    profile,
    isAdmin,
    loading,
    isAuthenticated: !!user,
  }
}

export default useAdminAuth 