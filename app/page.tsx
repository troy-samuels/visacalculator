"use client"

import { useState, useEffect } from "react"
import { Plus, Calendar, ChevronRight, AlertTriangle, Info, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format, differenceInDays } from "date-fns"
import type { DateRange } from "react-day-picker"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"
import { SchengenCalculator, type TravelRecord, type SchengenCalculationResult, type NextEntryResult } from "@/lib/schengen-calculator"
import { LanguageSelector } from "@/components/language-selector"
import { useTranslation } from "@/lib/i18n/translations"

interface VisaEntry {
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

export default function SchengenVisaCalculator() {
  // Create sample data to demonstrate the calculator functionality
  const createSampleData = (): VisaEntry[] => {
    return [
      {
        id: "1",
        country: "FR", // France
        startDate: new Date("2024-03-15"), // March 15, 2024
        endDate: new Date("2024-03-28"),   // March 28, 2024
        days: 0, // Will be calculated
        daysInLast180: 0, // Will be calculated
        daysRemaining: 0, // Will be calculated
        activeColumn: "complete" as const,
        warnings: []
      },
      {
        id: "2", 
        country: "DE", // Germany
        startDate: new Date("2024-05-10"), // May 10, 2024
        endDate: new Date("2024-05-24"),   // May 24, 2024
        days: 0, // Will be calculated
        daysInLast180: 0, // Will be calculated
        daysRemaining: 0, // Will be calculated
        activeColumn: "complete" as const,
        warnings: []
      },
      {
        id: "3",
        country: "ES", // Spain
        startDate: new Date("2024-06-20"), // June 20, 2024
        endDate: new Date("2024-07-05"),    // July 5, 2024
        days: 0, // Will be calculated
        daysInLast180: 0, // Will be calculated
        daysRemaining: 0, // Will be calculated
        activeColumn: "complete" as const,
        warnings: []
      },
      {
        id: "4",
        country: "IT", // Italy - Planned future trip
        startDate: new Date("2024-08-01"),  // August 1, 2024
        endDate: new Date("2024-08-15"),   // August 15, 2024
        days: 0, // Will be calculated
        daysInLast180: 0, // Will be calculated
        daysRemaining: 0, // Will be calculated
        activeColumn: "complete" as const,
        warnings: []
      },
      {
        id: "5",
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
  }

  const [entries, setEntries] = useState<VisaEntry[]>(createSampleData())
  const [isDemoMode, setIsDemoMode] = useState(true)

  const [calculationResult, setCalculationResult] = useState<SchengenCalculationResult | null>(null)
  const [nextEntryResult, setNextEntryResult] = useState<NextEntryResult | null>(null)
  const [calculator] = useState(() => new SchengenCalculator())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { t } = useTranslation()

  const loadDemoData = () => {
    setEntries(createSampleData())
    setIsDemoMode(true)
  }

  const startFresh = () => {
    setEntries([{
      id: "1",
      country: "",
      startDate: null,
      endDate: null,
      days: 0,
      daysInLast180: 0,
      daysRemaining: 90,
      activeColumn: "country",
      warnings: []
    }])
    setIsDemoMode(false)
  }

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard")
    }
  }, [user, authLoading, router])

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
      return
    }

    // Calculate current status from today's perspective
    const result = calculator.calculateDaysInSchengen(travelHistory)
    setCalculationResult(result)

    // Calculate next possible entry if not compliant
    if (!result.isCompliant || result.daysRemaining < 10) {
      const nextEntry = calculator.calculateNextPossibleEntry(travelHistory)
      setNextEntryResult(nextEntry)
    } else {
      setNextEntryResult(null)
    }

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

  const addEntry = () => {
    const newEntry: VisaEntry = {
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

  const updateEntry = (id: string, field: keyof VisaEntry, value: any) => {
    setEntries(currentEntries => {
      return currentEntries.map((entry) => {
        if (entry.id === id) {
          const updated = { ...entry, [field]: value }
          
          // Update active column based on completion state
          if (field === "country" && value) {
            updated.activeColumn = updated.startDate && updated.endDate ? "complete" : "dates"
          } else if ((field === "startDate" || field === "endDate") && updated.country && updated.startDate && updated.endDate) {
            updated.activeColumn = "complete"
            // Calculate days when both dates are available
            updated.days = differenceInDays(updated.endDate, updated.startDate) + 1
          }
          
          return updated
        }
        return entry
      })
    })
  }

  const updateDateRange = (id: string, dateRange: DateRange | undefined) => {
    setEntries(currentEntries => {
      return currentEntries.map((entry) => {
        if (entry.id === id) {
          const updated = {
            ...entry,
            startDate: dateRange?.from || null,
            endDate: dateRange?.to || null,
          }
          
          if (updated.startDate && updated.endDate) {
            updated.days = differenceInDays(updated.endDate, updated.startDate) + 1
            updated.activeColumn = "complete"
          } else {
            updated.days = 0
            updated.activeColumn = updated.country ? "dates" : "country"
          }
          
          return updated
        }
        return entry
      })
    })
  }

  const getColumnStyles = (entry: VisaEntry, columnType: "country" | "dates" | "results") => {
    const baseStyle = "transition-all duration-300"
    
    if (entry.activeColumn === columnType) {
      return `${baseStyle} bg-blue-50`
    } else if (entry.activeColumn === "complete" && columnType === "results") {
      return `${baseStyle} bg-green-50`
    }
    
    return `${baseStyle} bg-gray-50`
  }

  const getColumnBorderStyles = (entry: VisaEntry, columnType: "country" | "dates" | "results") => {
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F4F2ED" }}>
      {/* Header */}
      <header className="shadow-sm border-b border-gray-200" style={{ backgroundColor: "#F4F2ED" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900">Schengen Visa Calculator</h1>
              <nav className="hidden md:flex space-x-6">
                <Link href="/travel-quiz" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  🧭 Travel Quiz
                </Link>
                <Link href="/destination-checker" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  🌍 Destinations
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <div className="hidden md:flex items-center space-x-4">
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
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white py-4">
              <div className="flex flex-col space-y-4">
                <Link 
                  href="/travel-quiz" 
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>🧭</span>
                  <span>Travel Quiz</span>
                </Link>
                <Link 
                  href="/destination-checker" 
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>🌍</span>
                  <span>Destinations</span>
                </Link>
                <div className="flex flex-col space-y-2 px-4">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-black hover:bg-gray-800 text-white transition-colors duration-200 py-2 rounded-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      className="w-full text-white transition-colors duration-200 py-2 rounded-full hover:opacity-90"
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
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-in slide-in-from-bottom-8 duration-1000 ease-out">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Plan Smarter.
              <br />
              Travel Easier.
            </h1>
          </div>
          <div className="animate-in slide-in-from-bottom-8 duration-1000 delay-1000 ease-out">
            <h2 className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto border border-gray-300 rounded-lg p-6 bg-white/50 backdrop-blur-sm">
              Know Where You Can Go — Instantly See Visa Rules, Book Trips, and Travel Confidently.
            </h2>
          </div>
        </div>
      </section>

      {/* Warnings Section */}
      {calculationResult && !calculationResult.isCompliant && (
        <section className="pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Compliance Alert:</strong> You have exceeded the 90-day limit in the past 180 days. 
                Current usage: {calculationResult.daysUsed} out of 90 days allowed.
              </AlertDescription>
            </Alert>
          </div>
        </section>
      )}

      {/* Next Entry Info */}
      {nextEntryResult && nextEntryResult.nextPossibleEntry && (
        <section className="pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Next Entry Available:</strong> {format(nextEntryResult.nextPossibleEntry, "PPP")} 
                ({nextEntryResult.daysUntilEntry} days from now) with {nextEntryResult.daysAvailable} days available.
              </AlertDescription>
            </Alert>
          </div>
        </section>
      )}

      {/* Demo Controls */}
      <section className="pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center space-x-4">
            {isDemoMode ? (
              <div className="flex items-center space-x-4 bg-blue-50 border border-blue-200 rounded-lg px-6 py-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🧳</span>
                  <span className="text-blue-900 font-medium text-sm">Demo Mode: Showing sample travel history</span>
                </div>
                <Button
                  onClick={startFresh}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
                >
                  Start Fresh
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 bg-gray-50 border border-gray-200 rounded-lg px-6 py-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">✨</span>
                  <span className="text-gray-700 font-medium text-sm">Ready to plan your trips</span>
                </div>
                <Button
                  onClick={loadDemoData}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
                >
                  View Demo
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-visible">
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
                                onClick={() => updateDateRange(entry.id, undefined)}
                              >
                                Clear
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

      {/* Quick Destination Checker & Travel Quiz - Side by Side */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Destination Checker Card */}
            <div className="animate-in slide-in-from-bottom-8 duration-1000 delay-1000 ease-out">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-full">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🌍</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Where Can You Travel?
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Discover all visa-free destinations available to your passport instantly
                </p>
                <Link href="/destination-checker">
                  <Button 
                    className="w-full text-white font-medium py-3 rounded-lg hover:opacity-90 transition-all duration-200"
                    style={{ backgroundColor: "#FA9937" }}
                  >
                    Check Your Travel Options →
                  </Button>
                </Link>
                <p className="text-xs text-gray-500 mt-2">
                  Free • No registration required • Instant results
                </p>
              </div>
            </div>

            {/* Travel Quiz Card */}
            <div className="animate-in slide-in-from-bottom-8 duration-1000 delay-2000 ease-out">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl shadow-lg border border-purple-200 p-6 h-full">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🧭</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t("home.quiz.title")}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {t("home.quiz.subtitle")}
                </p>
                <Link href="/travel-quiz">
                  <Button 
                    variant="outline"
                    className="w-full font-medium py-3 rounded-lg border-purple-300 text-purple-700 hover:bg-purple-50 transition-all duration-200"
                  >
                    {t("home.quiz.button")}
                  </Button>
                </Link>
                <p className="text-xs text-gray-500 mt-2">
                  {t("home.quiz.features")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-gray-900 py-12" style={{ backgroundColor: "#F4F2ED" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
              <Button 
                variant="outline" 
                className="bg-gray-200 border-gray-300 text-gray-900 hover:bg-gray-300 rounded-full px-6"
              >
                Logo
              </Button>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
                <Link href="/legal-disclaimer" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Legal Disclaimer
                </Link>
                <Link href="/privacy-policy" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Privacy Policy
                </Link>
                <Link href="/terms-and-conditions" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Terms & Conditions
                </Link>
                <Link 
                  href="/admin-login" 
                  className="text-orange-600 hover:text-orange-800 transition-colors duration-200 flex items-center space-x-1" 
                  title="Admin Access"
                >
                  <span>🔐</span>
                  <span>Admin</span>
                </Link>
              </div>
            </div>
            <div className="border-t border-gray-300 pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-600">
                  © 2024 Schengen Visa Calculator. All rights reserved.
                </div>
                <div className="text-xs text-gray-500">
                  This tool provides estimates only. Please consult official sources for accurate visa requirements.
                </div>
              </div>
              {/* Deployment verification marker */}
              <div className="text-xs text-gray-400 mt-2 text-center">
                v2025.1.11.21.15 - Fresh deployment active
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
