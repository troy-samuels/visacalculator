"use client"

import { useState, useEffect } from "react"
import { Plus, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DateRangePicker from "@/components/ui/date-range-picker"
import { differenceInDays, subDays } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"

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

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
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

  const calculateDaysInLast180 = (startDate: Date, endDate: Date): number => {
    const today = new Date()
    const date180DaysAgo = subDays(today, 180)

    // If the entire trip is before the 180-day window, no days count
    if (endDate < date180DaysAgo) {
      return 0
    }

    // If the entire trip is in the future, no days count yet
    if (startDate > today) {
      return 0
    }

    // Calculate the overlap between the trip and the last 180 days
    const overlapStart = startDate > date180DaysAgo ? startDate : date180DaysAgo
    const overlapEnd = endDate < today ? endDate : today

    return differenceInDays(overlapEnd, overlapStart) + 1
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

  const updateDateRange = (id: string, startDate: Date | null, endDate: Date | null) => {
    const updatedEntries = entries.map((entry) => {
      if (entry.id === id) {
        const updatedEntry = {
          ...entry,
          startDate,
          endDate,
        }

        // Calculate days when both dates are selected
        if (updatedEntry.startDate && updatedEntry.endDate) {
          updatedEntry.days = differenceInDays(updatedEntry.endDate, updatedEntry.startDate) + 1
        } else {
          updatedEntry.days = 0
        }

        return updatedEntry
      }
      return entry
    })

    updateAllEntries(updatedEntries)
  }

  const getColumnStyles = (entry: VisaEntry, columnType: "country" | "dates" | "results") => {
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

  const getColumnBorderStyles = (entry: VisaEntry, columnType: "country" | "dates" | "results") => {
    const isActive =
      entry.activeColumn === columnType ||
      (columnType === "dates" && entry.activeColumn === "dates") ||
      (columnType === "results" && entry.activeColumn === "complete")

    return isActive ? "border-2" : "border"
  }

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      const updatedEntries = entries.filter((entry) => entry.id !== id)
      updateAllEntries(updatedEntries)
    }
  }

  const totalDaysInLast180 = entries.reduce((sum, entry) => sum + entry.daysInLast180, 0)
  const totalDaysRemaining = Math.max(0, 90 - totalDaysInLast180)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🇪🇺</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Schengen Visa Calculator</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Button onClick={() => router.push("/dashboard")} className="bg-blue-600 hover:bg-blue-700">
                  Dashboard
                </Button>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-blue-600 hover:bg-blue-700">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Calculate Your Schengen Visa Days
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Track your 90-day stays within any 180-day period across Schengen countries
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{totalDaysInLast180}</div>
                <div className="text-sm text-gray-600">Days Used</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{totalDaysRemaining}</div>
                <div className="text-sm text-gray-600">Days Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">90</div>
                <div className="text-sm text-gray-600">Total Allowed</div>
              </div>
            </div>
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
                      <DateRangePicker
                        startDate={entry.startDate}
                        endDate={entry.endDate}
                        onDateChange={(startDate, endDate) => updateDateRange(entry.id, startDate, endDate)}
                        disabled={!entry.country}
                        placeholder={!entry.country ? "Select country first" : "Select dates"}
                      />
                      {entry.activeColumn === "dates" && (
                        <div className="text-xs text-blue-600 mt-2 text-center font-medium relative z-10">
                          Select your travel dates
                        </div>
                      )}
                    </div>

                    {/* Days of Stay */}
                    <div
                      className={`${getColumnStyles(entry, "results")} rounded-lg p-4 text-center ${getColumnBorderStyles(entry, "results")}`}
                    >
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-2xl font-bold text-gray-900">{entry.days}</div>
                        <div className="text-xs text-gray-600">
                          {entry.days === 1 ? "day" : "days"}
                        </div>
                      </div>
                    </div>

                    {/* Days in Last 180 */}
                    <div
                      className={`${getColumnStyles(entry, "results")} rounded-lg p-4 text-center ${getColumnBorderStyles(entry, "results")}`}
                    >
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">{entry.daysInLast180}</div>
                        <div className="text-xs text-gray-600">
                          {entry.daysInLast180 === 1 ? "day" : "days"}
                        </div>
                      </div>
                      {entry.activeColumn === "complete" && (
                        <div className="text-xs text-green-600 mt-2 font-medium relative z-10">
                          Calculation complete
                        </div>
                      )}
                    </div>

                    {/* Days Remaining */}
                    <div
                      className={`${getColumnStyles(entry, "results")} rounded-lg p-4 text-center ${getColumnBorderStyles(entry, "results")}`}
                    >
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-2xl font-bold text-green-600">{entry.daysRemaining}</div>
                        <div className="text-xs text-gray-600">
                          {entry.daysRemaining === 1 ? "day" : "days"}
                        </div>
                      </div>
                      {entries.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEntry(entry.id)}
                          className="mt-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Entry Button */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={addEntry}
                  variant="outline"
                  className="flex items-center space-x-2 px-6 py-3 bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Trip</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Schengen Visa Calculator</h3>
            <p className="text-gray-400 mb-4">
              Calculate your 90-day stays within any 180-day period for Schengen Area travel
            </p>
            <div className="text-sm text-gray-500">
              © 2024 Schengen Visa Calculator. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
