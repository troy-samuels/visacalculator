"use client"

import { useState, useEffect } from "react"
import { Calendar, Plus } from "lucide-react"
import { format, differenceInDays } from "date-fns"

interface VisaEntry {
  id: string
  country: string
  startDate: string
  endDate: string
}

// Simple country list for Schengen area
const SCHENGEN_COUNTRIES = [
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IT", name: "Italy" },
  { code: "LV", name: "Latvia" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" },
  { code: "NL", name: "Netherlands" },
  { code: "NO", name: "Norway" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
]

export default function HomePage() {
  const [entries, setEntries] = useState<VisaEntry[]>([])
  const [totalDays, setTotalDays] = useState(0)
  const [daysRemaining, setDaysRemaining] = useState(90)

  // Calculate days when entries change
  useEffect(() => {
    calculateDays()
  }, [entries])

  const calculateDays = () => {
    const today = new Date()
    const sixMonthsAgo = new Date(today)
    sixMonthsAgo.setDate(today.getDate() - 180)

    let total = 0
    entries.forEach(entry => {
      if (entry.startDate && entry.endDate) {
        const start = new Date(entry.startDate)
        const end = new Date(entry.endDate)
        
        // Only count days within the last 180 days
        const effectiveStart = start > sixMonthsAgo ? start : sixMonthsAgo
        const effectiveEnd = end > today ? today : end
        
        if (effectiveStart <= effectiveEnd) {
          total += differenceInDays(effectiveEnd, effectiveStart) + 1
        }
      }
    })

    setTotalDays(total)
    setDaysRemaining(Math.max(0, 90 - total))
  }

  const addEntry = () => {
    const newEntry: VisaEntry = {
      id: Date.now().toString(),
      country: "",
      startDate: "",
      endDate: ""
    }
    setEntries([...entries, newEntry])
  }

  const updateEntry = (id: string, field: keyof VisaEntry, value: string) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ))
  }

  const removeEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Schengen Visa Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Track your days spent in the Schengen area
          </p>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Days Used (Last 180 days)
            </h3>
            <p className="text-3xl font-bold text-blue-600">{totalDays}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Days Remaining
            </h3>
            <p className={`text-3xl font-bold ${daysRemaining > 30 ? 'text-green-600' : daysRemaining > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
              {daysRemaining}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Status
            </h3>
            <p className={`text-xl font-semibold ${totalDays <= 90 ? 'text-green-600' : 'text-red-600'}`}>
              {totalDays <= 90 ? 'Compliant' : 'Over Limit'}
            </p>
          </div>
        </div>

        {/* Entries */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Travel Entries</h2>
            <button
              onClick={addEntry}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Entry
            </button>
          </div>

          {entries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No entries yet. Add your first travel entry to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div key={entry.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      value={entry.country}
                      onChange={(e) => updateEntry(entry.id, 'country', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select country</option>
                      {SCHENGEN_COUNTRIES.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entry Date
                    </label>
                    <input
                      type="date"
                      value={entry.startDate}
                      onChange={(e) => updateEntry(entry.id, 'startDate', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exit Date
                    </label>
                    <input
                      type="date"
                      value={entry.endDate}
                      onChange={(e) => updateEntry(entry.id, 'endDate', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => removeEntry(entry.id)}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            How the 90/180 rule works
          </h3>
          <p className="text-blue-800">
            You can stay in the Schengen area for up to 90 days within any 180-day period. 
            This calculator tracks your days over the last 180 days from today.
          </p>
        </div>
      </div>
    </div>
  )
}
