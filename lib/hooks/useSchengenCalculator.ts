"use client"

import { useCallback } from "react"
import { subDays, differenceInDays } from "date-fns"

interface Trip {
  id: string
  country: string
  startDate: Date | null
  endDate: Date | null
  days: number
  daysInLast180: number
  daysRemaining: number
  activeColumn: "country" | "dates" | "complete" | null
}

interface CalculatorResult {
  totalDaysUsed: number
  daysRemaining: number
  isCompliant: boolean
  overstayDays: number
  riskAssessment: {
    overallRisk: number
    riskLevel: "MINIMAL" | "LOW" | "MODERATE" | "HIGH" | "CRITICAL"
    riskFactors: any[]
    recommendations: any[]
  }
  nextResetDate: string | null
}

export function useSchengenCalculator() {
  const calculateCompliance = useCallback((trips: Trip[], referenceDate?: string) => {
    const today = referenceDate ? new Date(referenceDate) : new Date()
    const last180Days = subDays(today, 179) // 180 days including today

    let totalDaysUsed = 0

    trips.forEach((trip) => {
      if (trip.startDate && trip.endDate) {
        // Calculate overlap with last 180 days
        const tripStart = trip.startDate > last180Days ? trip.startDate : last180Days
        const tripEnd = trip.endDate < today ? trip.endDate : today

        if (tripStart <= tripEnd) {
          const diffDays = differenceInDays(tripEnd, tripStart) + 1
          totalDaysUsed += diffDays
        }
      }
    })

    const daysRemaining = Math.max(0, 90 - totalDaysUsed)
    const isCompliant = totalDaysUsed <= 90
    const overstayDays = Math.max(0, totalDaysUsed - 90)

    // Simple risk assessment
    let riskLevel: CalculatorResult["riskAssessment"]["riskLevel"] = "MINIMAL"
    if (totalDaysUsed > 80) riskLevel = "HIGH"
    else if (totalDaysUsed > 60) riskLevel = "MODERATE"
    else if (totalDaysUsed > 30) riskLevel = "LOW"

    return {
      totalDaysUsed,
      daysRemaining,
      isCompliant,
      overstayDays,
      riskAssessment: {
        overallRisk: totalDaysUsed,
        riskLevel,
        riskFactors: [],
        recommendations: [],
      },
      nextResetDate: null,
    }
  }, [])

  const calculateSingleEntryCompliance = useCallback((trip: Trip, referenceDate?: string) => {
    if (!trip.startDate || !trip.endDate) return 0

    const today = referenceDate ? new Date(referenceDate) : new Date()
    const last180Days = subDays(today, 179)

    // Calculate overlap with last 180 days
    const tripStart = trip.startDate > last180Days ? trip.startDate : last180Days
    const tripEnd = trip.endDate < today ? trip.endDate : today

    if (tripStart <= tripEnd) {
      return differenceInDays(tripEnd, tripStart) + 1
    }
    return 0
  }, [])

  const calculateMaximumStay = useCallback(
    (startDate: string, trips: Trip[]) => {
      const compliance = calculateCompliance(trips, startDate)
      return {
        maxConsecutiveDays: Math.min(compliance.daysRemaining, 90),
        immediatelyAvailable: compliance.daysRemaining,
      }
    },
    [calculateCompliance],
  )

  return {
    calculateCompliance,
    calculateSingleEntryCompliance,
    calculateMaximumStay,
    isEnhancedCalculatorAvailable: false, // Set to false since we removed it
  }
}
