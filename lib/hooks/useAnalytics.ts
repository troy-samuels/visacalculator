"use client"

import { useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

interface AnalyticsEvent {
  event_type: 'calculation' | 'signup' | 'destination_selected' | 'date_selected' | 'page_view'
  country_code?: string
  home_country?: string
  trip_duration_days?: number
  days_remaining?: number
}

export function useAnalytics() {
  const supabase = createClient()
  const sessionId = useRef<string>()

  // Generate anonymous session ID on first use
  useEffect(() => {
    if (!sessionId.current) {
      sessionId.current = generateSessionId()
    }
  }, [])

  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  const trackEvent = async (event: AnalyticsEvent) => {
    try {
      // Only track if we have a valid session ID
      if (!sessionId.current) return

      const { error } = await supabase
        .from('analytics_events')
        .insert({
          event_type: event.event_type,
          country_code: event.country_code || null,
          home_country: event.home_country || null,
          trip_duration_days: event.trip_duration_days || null,
          days_remaining: event.days_remaining || null,
          session_id: sessionId.current,
        })

      if (error) {
        console.warn('Analytics tracking failed:', error.message)
      }
    } catch (error) {
      // Silently fail - analytics should never break the user experience
      console.warn('Analytics error:', error)
    }
  }

  const trackCalculation = (destinationCountry: string, homeCountry: string, daysRemaining: number) => {
    trackEvent({
      event_type: 'calculation',
      country_code: destinationCountry,
      home_country: homeCountry,
      days_remaining: daysRemaining,
    })
  }

  const trackDestinationSelected = (countryCode: string, homeCountry?: string) => {
    trackEvent({
      event_type: 'destination_selected',
      country_code: countryCode,
      home_country: homeCountry,
    })
  }

  const trackDateSelected = (countryCode: string, tripDuration: number, homeCountry?: string) => {
    trackEvent({
      event_type: 'date_selected',
      country_code: countryCode,
      trip_duration_days: tripDuration,
      home_country: homeCountry,
    })
  }

  const trackSignup = (homeCountry?: string) => {
    trackEvent({
      event_type: 'signup',
      home_country: homeCountry,
    })
  }

  const trackPageView = () => {
    trackEvent({
      event_type: 'page_view',
    })
  }

  return {
    trackCalculation,
    trackDestinationSelected,
    trackDateSelected,
    trackSignup,
    trackPageView,
  }
}

export default useAnalytics 