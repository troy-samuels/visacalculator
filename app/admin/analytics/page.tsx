"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAdminAuth } from "@/lib/hooks/useAdminAuth"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Users, MapPin, TrendingUp, Activity, Globe, Clock } from "lucide-react"
import { format, subDays, subWeeks, subMonths, subYears, startOfDay, endOfDay } from "date-fns"

interface AnalyticsSummary {
  totalUsers: number
  totalCalculations: number
  totalSignups: number
  uniqueSessions: number
  avgTripDuration: number
  popularDestinations: Record<string, number>
  homeCountryBreakdown: Record<string, number>
  timeSeriesData: Array<{
    date: string
    calculations: number
    signups: number
    sessions: number
  }>
}

interface Country {
  code: string
  name: string
  flag: string
}

type TimePeriod = 'week' | 'month' | 'quarter' | 'year'

export default function AdminAnalyticsPage() {
  const { isAdmin, loading: authLoading } = useAdminAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/login')
    }
  }, [isAdmin, authLoading, router])

  useEffect(() => {
    if (isAdmin) {
      loadAnalytics()
      loadCountries()
    }
  }, [isAdmin, timePeriod])

  const loadCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('code, name, flag')
        .order('name')

      if (error) throw error
      setCountries(data || [])
    } catch (err) {
      console.error('Error loading countries:', err)
    }
  }

  const getDateRange = (period: TimePeriod) => {
    const now = new Date()
    switch (period) {
      case 'week':
        return { start: subWeeks(now, 1), end: now }
      case 'month':
        return { start: subMonths(now, 1), end: now }
      case 'quarter':
        return { start: subMonths(now, 3), end: now }
      case 'year':
        return { start: subYears(now, 1), end: now }
      default:
        return { start: subMonths(now, 1), end: now }
    }
  }

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { start, end } = getDateRange(timePeriod)

      // Load aggregated analytics data
      const { data: summaryData, error: summaryError } = await supabase
        .from('analytics_daily_summary')
        .select('*')
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'))
        .order('date', { ascending: true })

      if (summaryError) throw summaryError

      // Load raw events for more detailed analysis
      const { data: eventsData, error: eventsError } = await supabase
        .from('analytics_events')
        .select('event_type, country_code, home_country, trip_duration_days, created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())

      if (eventsError) throw eventsError

      // Load user statistics
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, home_country, created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())

      if (userError) throw userError

      // Process the data
      const processedAnalytics = processAnalyticsData(summaryData || [], eventsData || [], userData || [])
      setAnalytics(processedAnalytics)

    } catch (err) {
      console.error('Analytics loading error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const processAnalyticsData = (
    summaryData: any[],
    eventsData: any[],
    userData: any[]
  ): AnalyticsSummary => {
    // Aggregate totals
    const totalCalculations = summaryData.reduce((sum, day) => sum + (day.total_calculations || 0), 0)
    const totalSignups = summaryData.reduce((sum, day) => sum + (day.total_signups || 0), 0)
    const uniqueSessions = summaryData.reduce((sum, day) => sum + (day.unique_sessions || 0), 0)

    // Calculate average trip duration
    const tripDurations = eventsData
      .filter(event => event.trip_duration_days && event.trip_duration_days > 0)
      .map(event => event.trip_duration_days)
    const avgTripDuration = tripDurations.length > 0 
      ? tripDurations.reduce((sum, duration) => sum + duration, 0) / tripDurations.length 
      : 0

    // Popular destinations (anonymized)
    const destinationCounts: Record<string, number> = {}
    eventsData
      .filter(event => event.event_type === 'destination_selected' && event.country_code)
      .forEach(event => {
        destinationCounts[event.country_code] = (destinationCounts[event.country_code] || 0) + 1
      })

    // Home country breakdown (anonymized)
    const homeCountryCounts: Record<string, number> = {}
    userData
      .filter(user => user.home_country)
      .forEach(user => {
        homeCountryCounts[user.home_country] = (homeCountryCounts[user.home_country] || 0) + 1
      })

    // Time series data
    const timeSeriesData = summaryData.map(day => ({
      date: day.date,
      calculations: day.total_calculations || 0,
      signups: day.total_signups || 0,
      sessions: day.unique_sessions || 0,
    }))

    return {
      totalUsers: userData.length,
      totalCalculations,
      totalSignups,
      uniqueSessions,
      avgTripDuration: Math.round(avgTripDuration * 10) / 10,
      popularDestinations: destinationCounts,
      homeCountryBreakdown: homeCountryCounts,
      timeSeriesData,
    }
  }

  const getCountryName = (code: string): string => {
    const country = countries.find(c => c.code === code)
    return country ? `${country.flag} ${country.name}` : code
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F4F2ED" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F4F2ED" }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to view this page.</p>
          <Button onClick={() => router.push('/')} style={{ backgroundColor: "#FA9937" }}>
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F4F2ED" }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Analytics</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={loadAnalytics} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F4F2ED" }}>
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Activity className="h-6 w-6 text-gray-600" />
              <h1 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timePeriod} onValueChange={(value: TimePeriod) => setTimePeriod(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => router.push('/')} variant="outline">
                Back to App
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Analytics Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {analytics ? (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(analytics.totalUsers)}</div>
                  <p className="text-xs text-muted-foreground">
                    New users in {timePeriod}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Calculations</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(analytics.totalCalculations)}</div>
                  <p className="text-xs text-muted-foreground">
                    Visa calculations performed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(analytics.uniqueSessions)}</div>
                  <p className="text-xs text-muted-foreground">
                    Unique user sessions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Trip Length</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.avgTripDuration} days</div>
                  <p className="text-xs text-muted-foreground">
                    Average planned trip duration
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Popular Destinations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Popular Destinations</span>
                  </CardTitle>
                  <CardDescription>
                    Most selected Schengen countries (anonymized data)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.popularDestinations)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 10)
                      .map(([country, count]) => (
                        <div key={country} className="flex items-center justify-between">
                          <span className="text-sm">{getCountryName(country)}</span>
                          <span className="text-sm font-medium">{formatNumber(count)}</span>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>User Origins</span>
                  </CardTitle>
                  <CardDescription>
                    Top user home countries (anonymized data)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.homeCountryBreakdown)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 10)
                      .map(([country, count]) => (
                        <div key={country} className="flex items-center justify-between">
                          <span className="text-sm">{getCountryName(country)}</span>
                          <span className="text-sm font-medium">{formatNumber(count)}</span>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Time Series Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarDays className="h-5 w-5" />
                  <span>Activity Over Time</span>
                </CardTitle>
                <CardDescription>
                  Daily activity trends for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.timeSeriesData.length > 0 ? (
                    <div className="space-y-2">
                      {analytics.timeSeriesData.map((day, index) => (
                        <div key={day.date} className="flex items-center space-x-4 text-sm">
                          <div className="w-20 text-gray-600">
                            {format(new Date(day.date), 'MMM dd')}
                          </div>
                          <div className="flex-1 grid grid-cols-3 gap-4">
                            <div>
                              <span className="text-gray-500">Calcs:</span> {day.calculations}
                            </div>
                            <div>
                              <span className="text-gray-500">Signups:</span> {day.signups}
                            </div>
                            <div>
                              <span className="text-gray-500">Sessions:</span> {day.sessions}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No activity data available for this period
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Privacy Notice */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800">Privacy & Compliance Notice</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-orange-700">
                <ul className="space-y-1">
                  <li>• All data shown is aggregated and anonymized</li>
                  <li>• No personally identifiable information is displayed</li>
                  <li>• Users can opt out of analytics tracking in their profile</li>
                  <li>• Data is automatically purged according to retention policy</li>
                  <li>• Compliant with GDPR, CCPA, and other privacy regulations</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No analytics data available</p>
          </div>
        )}
      </div>
    </div>
  )
} 