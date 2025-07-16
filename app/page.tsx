"use client"

// Force dynamic rendering to bypass cache
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useState, useEffect } from "react"
import { Plus, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { differenceInDays, subDays, format } from "date-fns"
import type { DateRange } from "react-day-picker"
import Link from "next/link"
import { useRouter } from "next/navigation"
import SignupModal from "@/components/signup-modal"
import PrivacyNotice from "@/components/privacy-notice"
import { useAuth } from "@/lib/hooks/useAuth"
import { useAnalytics } from "@/lib/hooks/useAnalytics"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface VisaEntry {
  id: string
  country: string
  startDate: Date | null
  endDate: Date | null
  days: number
  daysInLast180: number
  daysRemaining: number
  activeColumn: "country" | "dates" | "complete" | null
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
  }, [percentage, animatedProgress])

  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference

  const getColor = () => {
    if (daysRemaining <= 0) return "#EF4444" // Red
    if (daysRemaining <= 30) return "#F59E0B" // Amber
    return "#10B981" // Green
  }

  return (
    <div className="flex items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="transparent"
          />
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

export default function SchengenVisaCalculator() {
  const [entries, setEntries] = useState<VisaEntry[]>([
    {
      id: "1",
      country: "",
      startDate: null,
      endDate: null,
      days: 0,
      daysInLast180: 0,
      daysRemaining: 90,
      activeColumn: "country",
    },
  ])
  
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [hasTriggeredSignup, setHasTriggeredSignup] = useState(false)
  const { user, profile, loading: authLoading } = useAuth()
  const { trackCalculation, trackDestinationSelected, trackDateSelected, trackPageView } = useAnalytics()
  const supabase = createClient()
  const router = useRouter()

  // Track page view on component mount
  useEffect(() => {
    trackPageView()
  }, [trackPageView])

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user && !authLoading) {
      router.push("/dashboard")
    }
  }, [user, authLoading, router])

  // Load user's visa entries when authenticated
  useEffect(() => {
    if (user && !authLoading) {
      loadUserEntries()
    }
  }, [user, authLoading])

  const loadUserEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("visa_entries")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error loading entries:", error)
        return
      }

      if (data && data.length > 0) {
        const loadedEntries = data.map((entry, index) => ({
          id: entry.id,
          country: entry.country_code,
          startDate: new Date(entry.start_date),
          endDate: new Date(entry.end_date),
          days: entry.days,
          daysInLast180: 0, // Will be recalculated
          daysRemaining: 90, // Will be recalculated
          activeColumn: "complete" as const,
        }))

        updateAllEntries(loadedEntries)
      }
    } catch (error) {
      console.error("Error loading entries:", error)
    }
  }

  const saveUserEntries = async (entriesToSave: VisaEntry[]) => {
    if (!user) return

    try {
      // First, delete existing entries for this user
      await supabase
        .from("visa_entries")
        .delete()
        .eq("user_id", user.id)

      // Then insert new entries
      const validEntries = entriesToSave.filter(entry => 
        entry.country && entry.startDate && entry.endDate
      )

      if (validEntries.length > 0) {
        const { error } = await supabase
          .from("visa_entries")
          .insert(
            validEntries.map(entry => ({
              user_id: user.id,
              country_code: entry.country,
              start_date: entry.startDate!.toISOString().split('T')[0],
              end_date: entry.endDate!.toISOString().split('T')[0],
              notes: null,
            }))
          )

        if (error) {
          console.error("Error saving entries:", error)
        }
      }
    } catch (error) {
      console.error("Error saving entries:", error)
    }
  }

  const calculateDaysInLast180 = (startDate: Date, endDate: Date) => {
    const today = new Date()
    const last180Days = subDays(today, 180)

    // Check if the trip overlaps with the last 180 days
    const tripStart = startDate > last180Days ? startDate : last180Days
    const tripEnd = endDate < today ? endDate : today

    if (tripStart <= tripEnd) {
      return differenceInDays(tripEnd, tripStart) + 1
    }
    return 0
  }

  const updateAllEntries = (updatedEntries: VisaEntry[]) => {
    // Calculate total days in last 180 days across all entries
    const totalDaysInLast180 = updatedEntries.reduce((sum, entry) => {
      if (entry.startDate && entry.endDate) {
        return sum + calculateDaysInLast180(entry.startDate, entry.endDate)
      }
      return sum
    }, 0)

    // Update each entry with days remaining and active column state
    const entriesWithRemaining = updatedEntries.map((entry) => {
      const daysInLast180 =
        entry.startDate && entry.endDate ? calculateDaysInLast180(entry.startDate, entry.endDate) : 0

      // Determine active column based on completion state
      let activeColumn: VisaEntry["activeColumn"] = "country"
      if (entry.country && !entry.startDate) {
        activeColumn = "dates"
      } else if (entry.country && entry.startDate && entry.endDate) {
        activeColumn = "complete"
      } else if (!entry.country) {
        activeColumn = "country"
      }

      return {
        ...entry,
        daysInLast180,
        daysRemaining: Math.max(0, 90 - totalDaysInLast180),
        activeColumn,
      }
    })

    setEntries(entriesWithRemaining)

    // Track calculation if we have complete data
    const completedEntries = entriesWithRemaining.filter(entry => 
      entry.country && entry.startDate && entry.endDate
    )
    
    if (completedEntries.length > 0) {
      const homeCountry = profile?.home_country || user?.user_metadata?.home_country
      const totalDaysRemaining = Math.max(0, 90 - totalDaysInLast180)
      
      // Track the calculation with the most recent destination
      const latestEntry = completedEntries[completedEntries.length - 1]
      trackCalculation(latestEntry.country, homeCountry || '', totalDaysRemaining)
    }

    // Auto-save for authenticated users
    if (user) {
      saveUserEntries(entriesWithRemaining)
    }

    // Check if we should show signup modal
    if (!user && !hasTriggeredSignup && entriesWithRemaining.length >= 2) {
      // Check if second entry or any subsequent entry has dates entered
      const entriesWithDates = entriesWithRemaining.slice(1); // Skip first entry
      const hasEntryWithDates = entriesWithDates.some(entry => 
        entry.startDate && entry.endDate
      );
      
      if (hasEntryWithDates) {
        setShowSignupModal(true)
        setHasTriggeredSignup(true)
      }
    }
  }

  const addEntry = () => {
    const newEntry: VisaEntry = {
      id: Date.now().toString(),
      country: "",
      startDate: null,
      endDate: null,
      days: 0,
      daysInLast180: 0,
      daysRemaining: 90,
      activeColumn: "country",
    }
    updateAllEntries([...entries, newEntry])
  }

  const updateEntry = (id: string, field: keyof VisaEntry, value: any) => {
    const updatedEntries = entries.map((entry) => {
      if (entry.id === id) {
        const updatedEntry = { ...entry, [field]: value }

        // Track destination selection
        if (field === "country" && value && value !== entry.country) {
          const homeCountry = profile?.home_country || user?.user_metadata?.home_country
          trackDestinationSelected(value, homeCountry || '')
        }

        // Calculate days when both dates are selected
        if (field === "startDate" || field === "endDate") {
          if (updatedEntry.startDate && updatedEntry.endDate) {
            updatedEntry.days = differenceInDays(updatedEntry.endDate, updatedEntry.startDate) + 1
          }
        }

        return updatedEntry
      }
      return entry
    })

    updateAllEntries(updatedEntries)
  }

  const updateDateRange = (id: string, range: DateRange | undefined) => {
    const updatedEntries = entries.map((entry) => {
      if (entry.id === id) {
        const updatedEntry = {
          ...entry,
          startDate: range?.from || null,
          endDate: range?.to || null,
        }

        // Calculate days when both dates are selected
        if (updatedEntry.startDate && updatedEntry.endDate) {
          updatedEntry.days = differenceInDays(updatedEntry.endDate, updatedEntry.startDate) + 1
          
          // Track date selection
          const homeCountry = profile?.home_country || user?.user_metadata?.home_country
          trackDateSelected(updatedEntry.country, updatedEntry.days, homeCountry || '')
        } else {
          updatedEntry.days = 0
        }

        return updatedEntry
      }
      return entry
    })

    updateAllEntries(updatedEntries)
  }

  const handleSignupSuccess = () => {
    // Refresh auth state and load user entries
    window.location.reload()
  }

  const getColumnStyles = (entry: VisaEntry, columnType: "country" | "dates" | "results") => {
    const isActive =
      entry.activeColumn === columnType ||
      (columnType === "dates" && entry.activeColumn === "dates") ||
      (columnType === "results" && entry.activeColumn === "complete")

    const isNext =
      (entry.activeColumn === "country" && columnType === "dates") ||
      (entry.activeColumn === "dates" && columnType === "results")

    const isCompleted =
      (entry.activeColumn === "dates" && columnType === "country") ||
      (entry.activeColumn === "complete" && (columnType === "country" || columnType === "dates"))

    let styles = "transition-all duration-500 ease-out relative "

    if (isActive) {
      styles += "z-50 scale-105 shadow-xl "
    } else if (isNext) {
      styles += "z-40 scale-100 shadow-lg opacity-90 "
    } else if (isCompleted) {
      styles += "z-30 scale-95 shadow-md opacity-75 "
    } else {
      styles += "z-10 scale-90 shadow-sm opacity-50 "
    }

    return styles
  }

  const getColumnBorderStyles = (entry: VisaEntry, columnType: "country" | "dates" | "results") => {
    const isActive =
      entry.activeColumn === columnType ||
      (columnType === "dates" && entry.activeColumn === "dates") ||
      (columnType === "results" && entry.activeColumn === "complete")

    const isNext =
      (entry.activeColumn === "country" && columnType === "dates") ||
      (entry.activeColumn === "dates" && columnType === "results")

    const isCompleted =
      (entry.activeColumn === "dates" && columnType === "country") ||
      (entry.activeColumn === "complete" && (columnType === "country" || columnType === "dates"))

    if (isActive) {
      return "border-2 border-blue-500 bg-blue-50"
    } else if (isNext) {
      return "border-2 border-orange-300 bg-orange-50"
    } else if (isCompleted) {
      return "border-2 border-green-300 bg-green-50"
    } else {
      return "border border-gray-200 bg-gray-50"
    }
  }

  const totalDays = entries.reduce((sum, entry) => sum + entry.days, 0)
  const totalDaysInLast180 = entries.reduce((sum, entry) => sum + entry.daysInLast180, 0)
  const totalDaysRemaining = Math.max(0, 90 - totalDaysInLast180)

  // Cache-busting timestamp for force refresh
  const deploymentId = "ENHANCED-CALENDAR-2025-01-15-23:58"
  
  return (
    <div 
      className="min-h-screen font-['Onest',sans-serif]" 
      style={{ backgroundColor: "#F4F2ED" }}
      data-deployment={deploymentId}
    >
      <style jsx>{`
        .blur-last-column {
          filter: blur(4px);
          transition: filter 0.3s ease;
          pointer-events: none;
        }
        

      `}</style>
      
      {/* Header */}
      <header className="shadow-sm border-b border-gray-200" style={{ backgroundColor: "#F4F2ED" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/schengenvisacalculatorlogo.png" 
                alt="Visa Calculator" 
                className="h-8 w-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button className="bg-black hover:bg-gray-800 text-white transition-colors duration-200 px-8 py-2 rounded-full">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  className="text-white transition-colors duration-200 px-8 py-2 rounded-full hover:opacity-90"
                  style={{ backgroundColor: "#FA9937" }}
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Plan Smarter
              <br />
              Travel Easier
            </h1>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Know Where You Can Go — Instantly See Visa Rules, Book Trips, and Travel Confidently.
            </h2>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
              <div className={`text-center ${showSignupModal ? 'blur-last-column' : ''}`}>
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
                        <SelectContent>
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
                        <PopoverContent className="w-auto p-0 bg-white rounded-2xl shadow-xl border-0" align="start">
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
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                              classNames={{
                                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                month: "space-y-4",
                                caption: "flex justify-center pt-1 relative items-center mb-4",
                                caption_label: "text-lg font-semibold text-gray-900",
                                nav: "space-x-1 flex items-center",
                                nav_button:
                                  "h-8 w-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors",
                                nav_button_previous: "absolute left-0",
                                nav_button_next: "absolute right-0",
                                table: "w-full border-collapse space-y-1",
                                head_row: "flex mb-2",
                                head_cell: "text-gray-600 rounded-md w-12 font-medium text-sm text-center",
                                row: "flex w-full mt-2",
                                cell: "text-center text-sm p-0 relative",
                                day: "h-12 w-12 p-0 font-medium hover:bg-gray-100 rounded-lg transition-all duration-200 border-2 border-transparent",
                                day_range_start:
                                  "!bg-slate-800 !text-white hover:!bg-slate-700 !border-slate-800 !rounded-lg !font-semibold shadow-md",
                                day_range_end:
                                  "!bg-slate-800 !text-white hover:!bg-slate-700 !border-slate-800 !rounded-lg !font-semibold shadow-md",
                                day_selected:
                                  "!bg-slate-800 !text-white hover:!bg-slate-700 !border-slate-800 !rounded-lg !font-semibold shadow-md",
                                day_today: "bg-blue-100 text-blue-900 font-bold border-2 border-blue-300",
                                day_outside: "text-gray-300 opacity-40",
                                day_disabled: "text-gray-200 opacity-30 cursor-not-allowed",
                                day_range_middle:
                                  "!bg-slate-200 !text-slate-900 hover:!bg-slate-300 !border-slate-200",
                                day_hidden: "invisible",
                              }}
                            />
                            <div className="flex gap-3 mt-6 pt-4 border-t">
                              <Button
                                variant="outline"
                                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                                onClick={() => {
                                  updateDateRange(entry.id, undefined)
                                }}
                              >
                                Clear
                              </Button>
                              <Button
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white"
                                onClick={() => {
                                  // Close popover - handled by popover component
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

                    {/* Days Remaining with Progress Circle - Apply blur when modal is open */}
                    <div className={`${getColumnStyles(entry, "results")} rounded-lg p-2 ${showSignupModal ? 'blur-last-column' : ''}`}>
                      <div className="flex items-center justify-center h-20">
                        <ProgressCircle daysRemaining={totalDaysRemaining} size={80} />
                      </div>
                    </div>
                  </div>
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
                      <div className={`text-sm text-blue-700 mt-1 ${showSignupModal ? 'blur-last-column' : ''}`}>
                        Days Remaining: <AnimatedCounter value={totalDaysRemaining} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Progress Section */}
              {totalDays > 0 && (
                <div className="border-t pt-6 mt-6">
                  <div className="text-center">
                    <div className="max-w-md mx-auto bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Your Progress</h3>
                      <Link href="/signup">
                        <Button
                          className="text-white px-8 py-3 rounded-full hover:opacity-90 font-medium"
                          style={{ backgroundColor: "#FA9937" }}
                        >
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-gray-900 py-12" style={{ backgroundColor: "#F4F2ED" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-8">
            {/* Top section with logo and links */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
              <div className="flex items-center">
                <Link href="/">
                  <img 
                    src="/schengenvisacalculatorlogo.png" 
                    alt="Visa Calculator" 
                    className="h-10 w-auto"
                  />
                </Link>
              </div>

              {/* Legal Links */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
                <a
                  href="/legal-disclaimer"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  Legal Disclaimer
                </a>
                <a href="/privacy-policy" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Privacy Policy
                </a>
                <a
                  href="/terms-and-conditions"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  Terms & Conditions
                </a>
              </div>
            </div>

            {/* Bottom section with copyright */}
            <div className="border-t border-gray-300 pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-600">© 2024 Schengen Visa Calculator. All rights reserved.</div>
                <div className="text-xs text-gray-500">
                  This tool provides estimates only. Please consult official sources for accurate visa requirements.
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {showSignupModal && <SignupModal isOpen={showSignupModal} onClose={() => setShowSignupModal(false)} onSuccess={handleSignupSuccess} />}
      <PrivacyNotice />
    </div>
  )
}
