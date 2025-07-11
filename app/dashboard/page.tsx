"use client"

import { useState, useEffect } from "react"
import { Plus, Calendar, ChevronRight, User, LogOut, AlertTriangle, Info, Download, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, differenceInDays, subDays } from "date-fns"
import type { DateRange } from "react-day-picker"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/useAuth"
import { useAdminAuth } from "@/lib/hooks/useAdminAuth"
import { createClient } from "@/lib/supabase/client"
import { ProfileCompletionModal } from "@/components/profile-completion-modal"
import type { Profile } from "@/lib/types/database"
import { useRouter } from "next/navigation"
import { SchengenCalculator, DataCaptureService, type TravelRecord, type SchengenCalculationResult, type NextEntryResult, type MonthlyBreakdown } from "@/lib/schengen-calculator"

interface VisaEntryLocal {
  id: string
  country: string
  startDate: Date | null
  endDate: Date | null
  days: number
  daysInLast180: number
  daysRemaining: number
  activeColumn: "country" | "dates" | "complete" | null
  warnings?: string[]
}

const schengenCountries = [
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬" },
  { code: "HR", name: "Croatia", flag: "🇭🇷" },
  { code: "CY", name: "Cyprus", flag: "🇨🇾" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "EE", name: "Estonia", flag: "🇪🇪" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "HU", name: "Hungary", flag: "🇭🇺" },
  { code: "IS", name: "Iceland", flag: "🇮🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "LV", name: "Latvia", flag: "🇱🇻" },
  { code: "LI", name: "Liechtenstein", flag: "🇱🇮" },
  { code: "LT", name: "Lithuania", flag: "🇱🇹" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺" },
  { code: "MT", name: "Malta", flag: "🇲🇹" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰" },
  { code: "SI", name: "Slovenia", flag: "🇸🇮" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
]

// Animated Counter Component
function AnimatedCounter({ value, duration = 500 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    if (displayValue === value) return

    const startValue = displayValue
    const difference = value - startValue
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.round(startValue + difference * easeOutQuart)

      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration, displayValue])

  return <span>{displayValue}</span>
}

// Progress Circle Component
function ProgressCircle({ daysRemaining, size = 120 }: { daysRemaining: number; size?: number }) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const maxDays = 90
  const percentage = Math.max(0, Math.min(100, (daysRemaining / maxDays) * 100))

  useEffect(() => {
    const startProgress = animatedProgress
    const targetProgress = percentage
    const startTime = Date.now()
    const duration = 800

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentProgress = startProgress + (targetProgress - startProgress) * easeOutQuart

      setAnimatedProgress(currentProgress)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [percentage])

  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference

  // Color logic based on days remaining
  const getColor = () => {
    if (daysRemaining > 60) return "#10B981" // Green (safe zone)
    if (daysRemaining > 45) return "#84CC16" // Light green 
    if (daysRemaining > 30) return "#EAB308" // Yellow (caution)
    if (daysRemaining > 15) return "#F59E0B" // Orange (warning)
    if (daysRemaining > 5) return "#EF4444"  // Red (danger)
    return "#DC2626" // Dark red (critical)
  }

  return (
    <div className="flex items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth="8" fill="transparent" />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`font-bold ${size > 100 ? "text-2xl" : "text-lg"}`} style={{ color: getColor() }}>
            <AnimatedCounter value={daysRemaining} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const { adminUser, loading: adminLoading, adminSignOut } = useAdminAuth()
  const router = useRouter()
  const supabase = createClient()

  const [entries, setEntries] = useState<VisaEntryLocal[]>([])
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [calculationResult, setCalculationResult] = useState<SchengenCalculationResult | null>(null)
  const [nextEntryResult, setNextEntryResult] = useState<NextEntryResult | null>(null)
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<MonthlyBreakdown | null>(null)
  const [calculator] = useState(() => new SchengenCalculator())
  const [dataCapture] = useState(() => new DataCaptureService())

  // Check authentication (both regular and admin)
  const isAuthenticated = !!(user || adminUser)
  const isLoading = authLoading || adminLoading
  const currentUser = adminUser || user
  const isAdmin = !!adminUser

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Load data when user is available
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        // Load sample data for admin
        loadAdminData()
      } else if (user && profile) {
        // Load real user data from Supabase
        loadUserData()
      }
    }
  }, [user, profile, adminUser, isAuthenticated, isAdmin])

  // Check if profile needs completion (only for regular users)
  useEffect(() => {
    if (!isAdmin && profile && !profile.profile_completed) {
      setShowProfileModal(true)
    }
  }, [profile, isAdmin])

  // Recalculate whenever entries change
  useEffect(() => {
    recalculateAll()
  }, [entries])

  const recalculateAll = () => {
    // Convert entries to TravelRecord format
    const travelHistory: TravelRecord[] = entries
      .filter(entry => entry.country && entry.startDate && entry.endDate)
      .map(entry => ({
        id: entry.id,
        country: entry.country,
        entryDate: entry.startDate!,
        exitDate: entry.endDate!
      }))

    if (travelHistory.length === 0) {
      setCalculationResult(null)
      setNextEntryResult(null)
      setMonthlyBreakdown(null)
      return
    }

    // Calculate current status from today's perspective
    const result = calculator.calculateDaysInSchengen(travelHistory)
    setCalculationResult(result)

    // Capture analytics data
    dataCapture.captureAnonymousData(result)

    // Calculate next possible entry if not compliant
    if (!result.isCompliant || result.daysRemaining < 10) {
      const nextEntry = calculator.calculateNextPossibleEntry(travelHistory)
      setNextEntryResult(nextEntry)
    } else {
      setNextEntryResult(null)
    }

    // Calculate monthly breakdown for the last year
    const endDate = new Date()
    const startDate = subDays(endDate, 365)
    const breakdown = calculator.getMonthlyBreakdown(travelHistory, startDate, endDate)
    setMonthlyBreakdown(breakdown)

    // Update each entry with proper calculations
    setEntries(currentEntries => {
      return currentEntries.map((entry, index) => {
        if (!entry.startDate || !entry.endDate) {
          // For incomplete entries, show current overall status
          return { 
            ...entry, 
            daysInLast180: 0,
            daysRemaining: result.daysRemaining,
            warnings: [] 
          }
        }

        // Calculate individual trip days
        const tripDays = differenceInDays(entry.endDate, entry.startDate) + 1

        // Calculate how many days from THIS trip fall within last 180 days from today
        const thisTrip: TravelRecord = {
          id: entry.id,
          country: entry.country,
          entryDate: entry.startDate,
          exitDate: entry.endDate
        }
        const thisTripResult = calculator.calculateDaysInSchengen([thisTrip])
        const thisTripDaysInLast180 = thisTripResult.daysUsed

        // For "days remaining": calculate cumulative impact up to this trip (progressive)
        const tripsUpToThis = travelHistory.slice(0, index + 1)
        const cumulativeResult = calculator.calculateDaysInSchengen(tripsUpToThis)

        // Validate this specific trip
        const tripValidation = calculator.validatePlannedTrip(
          travelHistory.filter(t => t.id !== entry.id),
          entry.startDate,
          entry.endDate,
          entry.country
        )

        return {
          ...entry,
          days: tripDays,
          daysInLast180: thisTripDaysInLast180, // Days from THIS trip that count in last 180
          daysRemaining: cumulativeResult.daysRemaining, // Days remaining after this trip (progressive)
          warnings: tripValidation.warnings,
          activeColumn: "complete" as const
        }
      })
    })
  }

  const loadAdminData = () => {
    // Load sample data for admin demonstration
    const sampleEntries: VisaEntryLocal[] = [
      {
        id: "admin-sample-1",
        country: "FR", // France
        startDate: subDays(new Date(), 45), // 45 days ago
        endDate: subDays(new Date(), 30),   // 30 days ago (15-day trip)
        days: 0, // Will be calculated
        daysInLast180: 0, // Will be calculated
        daysRemaining: 0, // Will be calculated
        activeColumn: "complete" as const,
        warnings: []
      },
      {
        id: "admin-sample-2",
        country: "DE", // Germany
        startDate: subDays(new Date(), 90), // 90 days ago
        endDate: subDays(new Date(), 75),   // 75 days ago (15-day trip)
        days: 0, // Will be calculated
        daysInLast180: 0, // Will be calculated
        daysRemaining: 0, // Will be calculated
        activeColumn: "complete" as const,
        warnings: []
      },
      {
        id: "admin-sample-3",
        country: "ES", // Spain
        startDate: subDays(new Date(), 20), // 20 days ago
        endDate: subDays(new Date(), 10),   // 10 days ago (10-day trip)
        days: 0, // Will be calculated
        daysInLast180: 0, // Will be calculated
        daysRemaining: 0, // Will be calculated
        activeColumn: "complete" as const,
        warnings: []
      }
    ]
    
    setEntries(sampleEntries)
    setLoading(false)
  }

  const loadUserData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data: visaEntries, error } = await supabase
        .from("visa_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Convert database entries to local format
      const localEntries: VisaEntryLocal[] = (visaEntries || []).map((entry) => ({
        id: entry.id,
        country: entry.country_code,
        startDate: new Date(entry.start_date),
        endDate: new Date(entry.end_date),
        days: entry.days || 0,
        daysInLast180: 0,
        daysRemaining: 90,
        activeColumn: "complete" as const,
        warnings: []
      }))

      if (localEntries.length === 0) {
        // Create realistic sample data to demonstrate saved travel history
        const sampleEntries: VisaEntryLocal[] = [
          {
            id: "sample-1",
            country: "FR", // France
            startDate: new Date(2024, 2, 15), // March 15, 2024
            endDate: new Date(2024, 2, 28),   // March 28, 2024
            days: 0, // Will be calculated
            daysInLast180: 0, // Will be calculated
            daysRemaining: 0, // Will be calculated
            activeColumn: "complete" as const,
            warnings: []
          },
          {
            id: "sample-2",
            country: "DE", // Germany
            startDate: new Date(2024, 4, 10), // May 10, 2024
            endDate: new Date(2024, 4, 24),   // May 24, 2024
            days: 0, // Will be calculated
            daysInLast180: 0, // Will be calculated
            daysRemaining: 0, // Will be calculated
            activeColumn: "complete" as const,
            warnings: []
          },
          {
            id: "sample-3",
            country: "ES", // Spain
            startDate: new Date(2024, 5, 20), // June 20, 2024
            endDate: new Date(2024, 6, 5),    // July 5, 2024
            days: 0, // Will be calculated
            daysInLast180: 0, // Will be calculated
            daysRemaining: 0, // Will be calculated
            activeColumn: "complete" as const,
            warnings: []
          },
          {
            id: "sample-4",
            country: "IT", // Italy - Future planned trip
            startDate: new Date(2024, 7, 1),  // August 1, 2024
            endDate: new Date(2024, 7, 15),   // August 15, 2024
            days: 0, // Will be calculated
            daysInLast180: 0, // Will be calculated
            daysRemaining: 0, // Will be calculated
            activeColumn: "complete" as const,
            warnings: []
          },
          {
            id: "new-entry",
            country: "",
            startDate: null,
            endDate: null,
            days: 0,
            daysInLast180: 0,
            daysRemaining: 90,
            activeColumn: "country",
            warnings: []
          }
        ]
        setEntries(sampleEntries)
      } else {
        setEntries(localEntries)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry: VisaEntryLocal) => {
    // Skip saving for admin users (no database access needed)
    if (isAdmin || !user || !entry.startDate || !entry.endDate || !entry.country) return

    try {
      const { error } = await supabase.from("visa_entries").upsert({
        id: entry.id === "1" ? undefined : entry.id, // Don't save the default entry ID
        user_id: user.id,
        country_code: entry.country,
        start_date: entry.startDate.toISOString().split("T")[0],
        end_date: entry.endDate.toISOString().split("T")[0],
        days: entry.days,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
    } catch (error) {
      console.error("Error saving entry:", error)
    }
  }

  const addEntry = () => {
    const newEntry: VisaEntryLocal = {
      id: Date.now().toString(),
      country: "",
      startDate: null,
      endDate: null,
      days: 0,
      daysInLast180: 0,
      daysRemaining: calculationResult?.daysRemaining || 90,
      activeColumn: "country",
      warnings: []
    }
    setEntries([...entries, newEntry])
  }

  const updateEntry = (id: string, field: keyof VisaEntryLocal, value: any) => {
    const updatedEntries = entries.map((entry) => {
      if (entry.id === id) {
        const updated = { ...entry, [field]: value }
        
        // Update active column based on completion state
        if (field === "country" && value) {
          updated.activeColumn = updated.startDate && updated.endDate ? "complete" : "dates"
        } else if ((field === "startDate" || field === "endDate") && updated.country && updated.startDate && updated.endDate) {
          updated.activeColumn = "complete"
        }
        
        // Auto-save if entry is complete
        if (updated.country && updated.startDate && updated.endDate) {
          const days = differenceInDays(updated.endDate, updated.startDate) + 1
          updated.days = days
          saveEntry(updated)
        }
        
        return updated
      }
      return entry
    })
    setEntries(updatedEntries)
  }

  const updateDateRange = (id: string, dateRange: DateRange | undefined) => {
    const updatedEntries = entries.map((entry) => {
      if (entry.id === id) {
        const updated = {
          ...entry,
          startDate: dateRange?.from || null,
          endDate: dateRange?.to || null,
        }
        
        if (updated.startDate && updated.endDate) {
          updated.days = differenceInDays(updated.endDate, updated.startDate) + 1
          updated.activeColumn = "complete"
          
          // Auto-save completed entry
          if (updated.country) {
            saveEntry(updated)
          }
        } else {
          updated.days = 0
          updated.activeColumn = updated.country ? "dates" : "country"
        }
        
        return updated
      }
      return entry
    })
    setEntries(updatedEntries)
  }

  const handleProfileComplete = async (updatedProfile: Partial<Profile>) => {
    // Skip profile updates for admin users
    if (isAdmin) {
      setShowProfileModal(false)
      return
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ ...updatedProfile, profile_completed: true })
        .eq("id", user?.id)

      if (error) throw error
      setShowProfileModal(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  const exportData = (format: 'json' | 'csv' = 'json') => {
    const analytics = dataCapture.exportAnalytics(format)
    const blob = new Blob([analytics], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `schengen-analytics.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getColumnStyles = (entry: VisaEntryLocal, columnType: "country" | "dates" | "results") => {
    const baseStyle = "transition-all duration-300"
    
    if (entry.activeColumn === columnType) {
      return `${baseStyle} bg-blue-50`
    } else if (entry.activeColumn === "complete" && columnType === "results") {
      return `${baseStyle} bg-green-50`
    }
    
    return `${baseStyle} bg-gray-50`
  }

  const getColumnBorderStyles = (entry: VisaEntryLocal, columnType: "country" | "dates" | "results") => {
    if (entry.activeColumn === columnType) {
      return "border-2 border-blue-300"
    } else if (entry.activeColumn === "complete" && columnType === "results") {
      return "border-2 border-green-300"
    }
    
    return "border border-gray-200"
  }

  const totalDays = entries.reduce((sum, entry) => sum + entry.days, 0)
  const totalDaysInLast180 = calculationResult?.daysUsed || 0
  const totalDaysRemaining = calculationResult?.daysRemaining || 90

  if (authLoading || adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F4F2ED" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const handleSignOut = () => {
    if (isAdmin) {
      adminSignOut()
      router.push("/")
    } else {
      signOut()
    }
  }

  const getUserDisplayName = () => {
    if (isAdmin && adminUser) {
      return `Admin: ${adminUser.name}`
    }
    if (profile?.first_name) {
      return `Hello, ${profile.first_name}`
    }
    if (user?.email) {
      return user.email
    }
    return "User"
  }

  return (
    <div className="min-h-screen font-['Onest',sans-serif]" style={{ backgroundColor: "#F4F2ED" }}>
      {/* Header */}
      <header className="shadow-sm border-b border-gray-200" style={{ backgroundColor: "#F4F2ED" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              {isAdmin && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  🔐 Admin Mode
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {getUserDisplayName()}
              </span>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Indicator */}
      <section className="bg-blue-50 border-b border-blue-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4 bg-blue-100 border border-blue-300 rounded-lg px-6 py-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🧳</span>
                <span className="text-blue-900 font-medium text-sm">
                  {isAdmin ? "Admin Dashboard: Sample travel data for demonstration" : "Welcome! Here's your travel history with sample data"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-400 text-blue-700 hover:bg-blue-200 bg-transparent"
                onClick={() => {
                  setEntries([{
                    id: "fresh-1",
                    country: "",
                    startDate: null,
                    endDate: null,
                    days: 0,
                    daysInLast180: 0,
                    daysRemaining: 90,
                    activeColumn: "country",
                    warnings: []
                  }])
                }}
              >
                Clear & Start Fresh
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calculator">Trip Calculator</TabsTrigger>
            <TabsTrigger value="analytics">Travel Analytics</TabsTrigger>
            <TabsTrigger value="export">Export Data</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            {/* Warnings Section */}
            {calculationResult && !calculationResult.isCompliant && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Compliance Alert:</strong> You have exceeded the 90-day limit in the past 180 days. 
                  Current usage: {calculationResult.daysUsed} out of 90 days allowed.
                </AlertDescription>
              </Alert>
            )}

            {/* Next Entry Info */}
            {nextEntryResult && nextEntryResult.nextPossibleEntry && (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Next Entry Available:</strong> {format(nextEntryResult.nextPossibleEntry, "PPP")} 
                  ({nextEntryResult.daysUntilEntry} days from now) with {nextEntryResult.daysAvailable} days available.
                </AlertDescription>
              </Alert>
            )}

            {/* Calculator */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Column Headers */}
              <div
                className="grid gap-4 p-6 bg-gray-50 border-b"
                style={{ gridTemplateColumns: "1fr 2fr 1.2fr 1.5fr 1fr" }}
              >
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900">Country</h3>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900">Date Range</h3>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900">Days of Stay</h3>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 text-sm">Days of Stay in the last 180 days</h3>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900">Days Remaining</h3>
                </div>
              </div>

              {/* Calculator Rows */}
              <div className="p-6 space-y-8">
                {entries.map((entry, index) => (
                  <div key={entry.id} className="relative">
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center mb-4 space-x-2 relative z-20">
                      <div
                        className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                          entry.activeColumn === "country"
                            ? "bg-blue-500"
                            : entry.country
                              ? "bg-green-500"
                              : "bg-gray-300"
                        }`}
                      />
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <div
                        className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                          entry.activeColumn === "dates"
                            ? "bg-blue-500"
                            : (entry.startDate && entry.endDate)
                              ? "bg-green-500"
                              : entry.country
                                ? "bg-orange-400"
                                : "bg-gray-300"
                        }`}
                      />
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <div
                        className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                          entry.activeColumn === "complete" ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                    </div>

                    <div className="grid gap-6 items-center" style={{ gridTemplateColumns: "1fr 2fr 1.2fr 1.5fr 1fr" }}>
                      {/* Country Selection */}
                      <div
                        className={`${getColumnStyles(entry, "country")} rounded-lg p-4 ${getColumnBorderStyles(entry, "country")}`}
                      >
                        <Select value={entry.country} onValueChange={(value) => updateEntry(entry.id, "country", value)}>
                          <SelectTrigger className="w-full bg-white text-center h-12 border-0 shadow-sm">
                            <SelectValue placeholder="🇪🇺" />
                          </SelectTrigger>
                          <SelectContent className="z-50 bg-white">
                            {schengenCountries.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">{country.flag}</span>
                                  <span>{country.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {entry.activeColumn === "country" && (
                          <div className="text-xs text-blue-600 mt-2 text-center font-medium relative z-10">
                            Select a country to continue
                          </div>
                        )}
                      </div>

                      {/* Date Range */}
                      <div
                        className={`${getColumnStyles(entry, "dates")} rounded-lg p-4 ${getColumnBorderStyles(entry, "dates")}`}
                      >
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-center text-center font-normal bg-white h-12 text-sm px-4 border-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!entry.country}
                            >
                              <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                              <span className="truncate">
                                {!entry.country
                                  ? "Select country first"
                                  : entry.startDate && entry.endDate
                                    ? `${format(entry.startDate, "MMM dd")} - ${format(entry.endDate, "MMM dd")}`
                                    : entry.startDate
                                      ? `${format(entry.startDate, "MMM dd")} - End date`
                                      : "Select dates"}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white rounded-2xl shadow-xl border-0 z-50" align="start">
                            <div className="p-6">
                              <CalendarComponent
                                mode="range"
                                selected={{
                                  from: entry.startDate || undefined,
                                  to: entry.endDate || undefined,
                                }}
                                onSelect={(range) => updateDateRange(entry.id, range)}
                                numberOfMonths={2}
                                className="rounded-none border-0"
                              />
                              <div className="flex gap-3 mt-6 pt-4 border-t">
                                <Button
                                  variant="outline"
                                  className="flex-1 border-slate-300 text-slate-700 hover:bg-gray-50 bg-transparent"
                                  onClick={() => {
                                    updateDateRange(entry.id, undefined)
                                  }}
                                >
                                  Clear
                                </Button>
                                <Button
                                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white"
                                  onClick={() => {
                                    // Close popover - this would be handled by the popover component
                                  }}
                                >
                                  Done
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        {entry.activeColumn === "dates" && (
                          <div className="text-xs text-blue-600 mt-2 text-center font-medium relative z-10">
                            {!entry.country ? "Select a country first" : "Select your travel dates"}
                          </div>
                        )}
                      </div>

                      {/* Results Columns */}
                      <div
                        className={`${getColumnStyles(entry, "results")} rounded-lg p-4 ${getColumnBorderStyles(entry, "results")}`}
                      >
                        <div className="bg-white rounded-lg p-3 font-semibold text-base text-center border-0 shadow-sm h-12 flex items-center justify-center">
                          {entry.days > 0 ? `${entry.days} days` : "—"}
                        </div>
                      </div>

                      <div
                        className={`${getColumnStyles(entry, "results")} rounded-lg p-4 ${getColumnBorderStyles(entry, "results")}`}
                      >
                        <div className="bg-white rounded-lg p-3 font-semibold text-base text-center border-0 shadow-sm h-12 flex items-center justify-center">
                          {entry.daysInLast180 > 0 ? `${entry.daysInLast180} days` : "—"}
                        </div>
                      </div>

                      {/* Days Remaining with Progress Circle */}
                      <div className={`${getColumnStyles(entry, "results")} rounded-lg p-2`}>
                        <div className="flex items-center justify-center h-20">
                          <ProgressCircle daysRemaining={entry.daysRemaining} size={80} />
                        </div>
                      </div>
                    </div>

                    {/* Warnings for this entry */}
                    {entry.warnings && entry.warnings.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {entry.warnings.map((warning, idx) => (
                          <Alert key={idx} className="border-orange-200 bg-orange-50">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-800 text-sm">
                              {warning}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Row Button */}
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={addEntry}
                    variant="outline"
                    className="flex items-center space-x-2 hover:bg-gray-50 transition-colors duration-200 bg-transparent rounded-full px-6"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Another Trip</span>
                  </Button>
                </div>

                {/* Total Days */}
                {totalDays > 0 && (
                  <div className="border-t pt-4 mt-6">
                    <div className="text-center">
                      <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-6 py-3">
                        <span className="text-blue-900 font-semibold text-lg">
                          Total Days in Last 180 Days: {totalDaysInLast180} / 90
                        </span>
                        <div className="text-sm text-blue-700 mt-1">
                          Days Remaining: <AnimatedCounter value={totalDaysRemaining} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Summary Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Travel Summary</CardTitle>
                  <CardDescription>Your travel patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Trips:</span>
                      <span className="font-semibold">{entries.filter(e => e.startDate && e.endDate).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Days Used:</span>
                      <span className="font-semibold">{totalDaysInLast180} / 90</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Compliance:</span>
                      <span className={`font-semibold ${calculationResult?.isCompliant ? 'text-green-600' : 'text-red-600'}`}>
                        {calculationResult?.isCompliant ? 'Compliant' : 'Non-Compliant'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Breakdown */}
              {monthlyBreakdown && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Monthly Travel Breakdown</CardTitle>
                    <CardDescription>Last 12 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(monthlyBreakdown)
                        .sort(([a], [b]) => b.localeCompare(a))
                        .slice(0, 6)
                        .map(([month, data]) => (
                          <div key={month} className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm font-medium text-gray-600">{month}</div>
                            <div className="text-2xl font-bold text-blue-600">{data.days}</div>
                            <div className="text-xs text-gray-500">days</div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Travel Data
                </CardTitle>
                <CardDescription>
                  Download your travel calculations and analytics for record keeping
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button 
                    onClick={() => exportData('json')}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export as JSON
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => exportData('csv')}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export as CSV
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Your data includes trip calculations, compliance status, and anonymous usage analytics.
                  No personal information is included in the export.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onComplete={handleProfileComplete}
        currentProfile={profile}
      />
    </div>
  )
}
