"use client"

import { useEffect, useState } from "react"

interface AdminUser {
  id: string
  email: string
  role: "admin"
  name: string
}

export function useAdminAuth() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    try {
      // Check for existing admin session
      const adminSession = localStorage.getItem("admin_session")
      if (adminSession) {
        try {
          const adminData = JSON.parse(adminSession)
          setAdminUser(adminData)
        } catch (error) {
          console.error("Error parsing admin session:", error)
          localStorage.removeItem("admin_session")
        }
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error)
    }
    
    setLoading(false)
  }, [])

  const adminSignIn = (username: string, password: string): boolean => {
    // Simple admin credentials - you can change these
    const ADMIN_USERNAME = "admin@schengenvisacalculator.com"
    const ADMIN_PASSWORD = "admin123!"

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const adminData: AdminUser = {
        id: "admin-001",
        email: ADMIN_USERNAME,
        role: "admin",
        name: "Admin User"
      }
      
      setAdminUser(adminData)
      
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem("admin_session", JSON.stringify(adminData))
        } catch (error) {
          console.error("Error saving admin session:", error)
        }
      }
      
      return true
    }
    return false
  }

  const adminSignOut = () => {
    setAdminUser(null)
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem("admin_session")
      } catch (error) {
        console.error("Error removing admin session:", error)
      }
    }
  }

  return {
    adminUser,
    loading,
    adminSignIn,
    adminSignOut,
    isAdminAuthenticated: !!adminUser,
  }
} 