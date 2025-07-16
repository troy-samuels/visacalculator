"use client"

import { useState, useEffect } from "react"
import { Plus, Calendar, ChevronRight, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, differenceInDays } from "date-fns"
import type { DateRange } from "react-day-picker"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/useAuth"
import { createClient } from "@/lib/supabase/client"
import { ProfileCompletionModal } from "@/components/profile-completion-modal"
import type { Profile, Country } from "@/lib/types/database"
import { useRouter } from "next/navigation"
import { useSchengenCalculator } from "@/lib/hooks/useSchengenCalculator"

interface VisaEntryLocal {
  id: string
  country: string
  startDate: Date | null
  endDate: Date | null
  days: number
  daysInLast180: number
  daysRemaining: number
  activeColumn: "country" | "dates" | "complete" | null
}

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
    if (daysRemaining > 60) return "#10B981" // Green
    if (daysRemaining > 30) return "#F59E0B" // Yellow/Orange
    if (daysRemaining > 10) return "#EF4444" // Red
    return "#DC2626" // Dark Red
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
  const router = useRouter()
  const supabase = createClient()
  const { calculateCompliance, calculateSingleEntryCompliance } = useSchengenCalculator()

  const [entries, setEntries] = useState<VisaEntryLocal[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Load data when user is available
  useEffect(() => {
    if (user && profile) {
      loadUserData()
      loadCountries()
    }
  }, [user, profile])

  // Check if profile needs completion
  useEffect(() => {
    if (profile && !profile.profile_completed) {
      setShowProfileModal(true)
    }
  }, [profile])

  const loadCountries = async () => {
    try {
      const { data, error } = await supabase.from("countries").select("*").order("name")

      if (error) throw error
      setCountries(data || [])
    } catch (error) {
      console.error("Error loading countries:", error)
    }
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
      }))

      // If no entries, create a default one
      if (localEntries.length === 0) {
        localEntries.push({
          id: "new-1",
          country: "",
          startDate: null,
          endDate: null,
          days: 0,
          daysInLast180: 0,
          daysRemaining: 90,
          activeColumn: "country",
        })
      }

      updateAllEntries(localEntries)
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry: VisaEntryLocal) => {
    if (!user || !entry.startDate || !entry.endDate || !entry.country) return

    try {
      const entryData = {
        user_id: user.id,
        country_code: entry.country,
        start_date: entry.startDate.toISOString().split("T")[0],
        end_date: entry.endDate.toISOString().split("T")[0],
      }

      if (entry.id.startsWith("new-")) {
        // Create new entry
        const { error } = await supabase.from("visa_entries").insert(entryData)
        if (error) throw error
      } else {
        // Update existing entry
        const { error } = await supabase.from("visa_entries").update(entryData).eq("id", entry.id)
        if (error) throw error
      }
    } catch (error) {
      console.error("Error saving entry:", error)
    }
  }

  const updateAllEntries = (updatedEntries: VisaEntryLocal[]) => {
    // Calculate overall compliance
    const compliance = calculateCompliance(updatedEntries)

    const entriesWithRemaining = updatedEntries.map((entry) => {
      // Calculate individual entry days
      const entryDaysUsed = calculateSingleEntryCompliance(entry)

      let activeColumn: VisaEntryLocal["activeColumn"] = "country"
      if (entry.country && !entry.startDate) {
        activeColumn = "dates"
      } else if (entry.country && entry.startDate && entry.endDate) {
        activeColumn = "complete"
      } else if (!entry.country) {
        activeColumn = "country"
      }

      return {
        ...entry,
        daysInLast180: entryDaysUsed,
        daysRemaining: compliance.daysRemaining,
        activeColumn,
      }
    })

    setEntries(entriesWithRemaining)
  }

  const addEntry = () => {
    const newEntry: VisaEntryLocal = {
      id: `new-${Date.now()}`,
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

  const updateEntry = (id: string, field: keyof VisaEntryLocal, value: any) => {
    const updatedEntries = entries.map((entry) => {
      if (entry.id === id) {
        const updatedEntry = { ...entry, [field]: value }

        // Calculate days when both dates are selected
        if (field === "startDate" || field === "endDate") {
          if (updatedEntry.startDate && updatedEntry.endDate) {
            updatedEntry.days = differenceInDays(updatedEntry.endDate, updatedEntry.startDate) + 1
          }
        }

        // Auto-save when entry is complete
        if (updatedEntry.country && updatedEntry.startDate && updatedEntry.endDate) {
          saveEntry(updatedEntry)
        }

        return updatedEntry
      }
      return entry
    })

    updateAllEntries(updatedEntries)
  }

  const updateDateRange = (id: string, dateRange: DateRange | undefined) => {
    const updatedEntries = entries.map((entry) => {
      if (entry.id === id) {
        const updatedEntry = {
          ...entry,
          startDate: dateRange?.from || null,
          endDate: dateRange?.to || null,
        }

        // Calculate days when both dates are selected
        if (updatedEntry.startDate && updatedEntry.endDate) {
          updatedEntry.days = differenceInDays(updatedEntry.endDate, updatedEntry.startDate) + 1
        } else {
          updatedEntry.days = 0
        }

        // Auto-save when entry is complete
        if (updatedEntry.country && updatedEntry.startDate && updatedEntry.endDate) {
          saveEntry(updatedEntry)
        }

        return updatedEntry
      }
      return entry
    })

    updateAllEntries(updatedEntries)
  }

  const handleProfileComplete = async (updatedProfile: Partial<Profile>) => {
    if (!user) return

    try {
      const { error } = await supabase.from("profiles").update(updatedProfile).eq("id", user.id)

      if (error) throw error
      setShowProfileModal(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  const getColumnStyles = (entry: VisaEntryLocal, columnType: "country" | "dates" | "results") => {
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

  const getColumnBorderStyles = (entry: VisaEntryLocal, columnType: "country" | "dates" | "results") => {
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

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F4F2ED" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen font-['Onest',sans-serif]" style={{ backgroundColor: "#F4F2ED" }}>
      {/* Header */}
      <header className="shadow-sm border-b border-gray-200" style={{ backgroundColor: "#F4F2ED" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <img src="/images/visa-calculator-logo.png" alt="Visa Calculator" className="h-8 w-auto mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">Schengen Visa Calculator</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>
                  {profile?.first_name && profile?.last_name
                    ? `${profile.first_name} ${profile.last_name}`
                    : profile?.email}
                </span>
              </div>
              <Button
                onClick={signOut}
                variant="outline"
                className="flex items-center space-x-2 hover:bg-gray-50 transition-colors duration-200 bg-transparent rounded-full px-4"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Welcome back{profile?.first_name ? `, ${profile.first_name}` : ""}!
          </h1>
          <p className="text-lg text-gray-600">
            Your visa calculations are automatically saved. Continue planning your travels below.
          </p>
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
                        <SelectContent>
                          {countries
                            .filter((country) => country.is_schengen)
                            .map((country) => (
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
                                head_cell: "text-gray-600 rounded-md w-10 font-medium text-sm text-center",
                                row: "flex w-full mt-2",
                                cell: "text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-lg transition-colors",
                                day_range_start:
                                  "day-range-start bg-slate-800 text-white hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white rounded-lg",
                                day_range_end:
                                  "day-range-end bg-slate-800 text-white hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white rounded-lg",
                                day_selected:
                                  "bg-slate-800 text-white hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white rounded-lg",
                                day_today: "bg-gray-100 text-gray-900 font-semibold",
                                day_outside: "text-gray-400 opacity-50",
                                day_disabled: "text-gray-400 opacity-50",
                                day_range_middle:
                                  "aria-selected:bg-slate-100 aria-selected:text-slate-900 hover:bg-slate-100",
                                day_hidden: "invisible",
                              }}
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
                              <Button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white">Done</Button>
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
            </div>
          </div>
        </div>
      </section>

      {/* Profile Completion Modal */}
      {showProfileModal && profile && (
        <ProfileCompletionModal
          profile={profile}
          countries={countries}
          onComplete={handleProfileComplete}
          onSkip={() => setShowProfileModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="text-gray-900 py-12" style={{ backgroundColor: "#F4F2ED" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
              <img src="/images/visa-calculator-logo.png" alt="Visa Calculator" className="h-8 w-auto" />

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
    </div>
  )
}
