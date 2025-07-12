"use client"

import { useEffect } from "react"

const APP_VERSION = "2025.01.12.08.14"

export function CacheCheck() {
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return

    try {
      const cachedVersion = localStorage.getItem('app_version')
      
      if (cachedVersion !== APP_VERSION) {
        console.log('Cache version mismatch, forcing refresh...')
        localStorage.setItem('app_version', APP_VERSION)
        
        // Force a hard refresh to clear cache
        window.location.reload()
      }
    } catch (error) {
      console.error('Error checking cache version:', error)
    }
  }, [])

  return null
} 