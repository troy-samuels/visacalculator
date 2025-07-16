"use client"

import { useState, useEffect } from "react"
import { Plus, Calendar, ChevronRight, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, differenceInDays, subDays } from "date-fns"
import type { DateRange } from "react-day-picker"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/useAuth"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { ProfileCompletionModal } from "@/components/profile-completion-modal"
import type { Profile, Country } from "@/lib/types/database"
import { useRouter } from "next/navigation"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { ProgressCircle } from "@/components/ui/progress-circle"

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

export default function DashboardPage() {
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const [entries, setEntries] = useState<VisaEntryLocal[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadUserData()
      loadCountries()
    }
  }, [user])

  useEffect(() => {
    if (profile && (!profile.full_name || !profile.home_country)) {
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

  const updateAllEntries = (updatedEntries: VisaEntryLocal[]) => {
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
        daysInLast180,
        daysRemaining: Math.max(0, 90 - totalDaysInLast180),
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

  const getColumnStyles = (entry: VisaEntryLocal, columnType: "country" | "dates" | "results") => {
    const isActive =
      entry.activeColumn === columnType ||
      (columnType === "dates" && entry.activeColumn === "dates") ||
      (columnType === "results" && entry.activeColumn === "complete")

    const isCompleted =
      (columnType === "country" && entry.country) ||
      (columnType === "dates" && entry.startDate && entry.endDate) ||
      (columnType === "results" && entry.startDate && entry.endDate)

    if (isActive) {
      return "bg-blue-50 border-blue-200"
    } else if (isCompleted) {
      return "bg-green-50 border-green-200"
    } else {
      return "bg-gray-50 border-gray-200"
    }
  }

  const getColumnBorderStyles = (entry: VisaEntryLocal, columnType: "country" | "dates" | "results") => {
    const isActive =
      entry.activeColumn === columnType ||
      (columnType === "dates" && entry.activeColumn === "dates") ||
      (columnType === "results" && entry.activeColumn === "complete")

    return isActive ? "border-2" : "border"
  }

  const removeEntry = async (id: string) => {
    if (entries.length > 1) {
      if (!id.startsWith("new-")) {
        // Delete from database
        await supabase.from("visa_entries").delete().eq("id", id)
      }
      const updatedEntries = entries.filter((entry) => entry.id !== id)
      updateAllEntries(updatedEntries)
    }
  }

  const totalDays = entries.reduce((sum, entry) => sum + entry.days, 0)
  const totalDaysInLast180 = entries.reduce((sum, entry) => sum + entry.daysInLast180, 0)
  const totalDaysRemaining = Math.max(0, 90 - totalDaysInLast180)

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              {profile && (
                <span className="text-gray-600">Welcome back, {profile.full_name || profile.email}</span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setShowProfileModal(true)}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
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
                              <Button
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white"
                                onClick={() => {
                                  // Close popover - handled by the popover component
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
                        <ProgressCircle daysRemaining={totalDaysRemaining} size={80} />
                      </div>
                      {entries.length > 1 && (
                        <div className="text-center mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEntry(entry.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs"
                          >
                            Remove
                          </Button>
                        </div>
                      )}
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

              {/* Total Summary */}
              {totalDays > 0 && (
                <div className="border-t pt-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        <AnimatedCounter value={totalDaysInLast180} />
                      </div>
                      <div className="text-blue-800 font-medium">Days Used (Last 180)</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                      <div className="text-3xl font-bold text-green-600">
                        <AnimatedCounter value={totalDaysRemaining} />
                      </div>
                      <div className="text-green-800 font-medium">Days Remaining</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <div className="text-3xl font-bold text-gray-600">90</div>
                      <div className="text-gray-800 font-medium">Total Allowed</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        countries={countries}
      />
    </div>
  )
}
