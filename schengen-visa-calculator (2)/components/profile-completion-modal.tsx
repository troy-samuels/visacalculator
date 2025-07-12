"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import type { Profile, Country } from "@/lib/types/database"

interface ProfileCompletionModalProps {
  profile: Profile
  countries: Country[]
  onComplete: (updatedProfile: Partial<Profile>) => Promise<void>
  onSkip: () => void
}

const travelReasons = [
  { value: "digital_nomad", label: "Digital Nomad" },
  { value: "business", label: "Business Traveller" },
  { value: "tourism", label: "Tourism" },
  { value: "student", label: "Student" },
]

export function ProfileCompletionModal({ profile, countries, onComplete, onSkip }: ProfileCompletionModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    home_country: profile.home_country || "",
    travel_reason: profile.travel_reason || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onComplete({
        ...formData,
        profile_completed: true,
      })
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-white/20 p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
          <Button variant="ghost" size="sm" onClick={onSkip} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-600" />
          </Button>
        </div>

        <p className="text-gray-600 mb-6">
          Help us personalize your visa calculation experience by completing your profile.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="text"
              placeholder="First name"
              value={formData.first_name}
              onChange={(e) => handleInputChange("first_name", e.target.value)}
              className="bg-gray-50 border-gray-200 rounded-xl h-12 px-4 focus:bg-white focus:border-gray-300 transition-colors"
              required
            />
            <Input
              type="text"
              placeholder="Last name"
              value={formData.last_name}
              onChange={(e) => handleInputChange("last_name", e.target.value)}
              className="bg-gray-50 border-gray-200 rounded-xl h-12 px-4 focus:bg-white focus:border-gray-300 transition-colors"
              required
            />
          </div>

          {/* Home Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Home Country</label>
            <Select value={formData.home_country} onValueChange={(value) => handleInputChange("home_country", value)}>
              <SelectTrigger className="bg-gray-50 border-gray-200 rounded-xl h-12 focus:bg-white focus:border-gray-300">
                <SelectValue placeholder="Select your home country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{country.flag}</span>
                      <span>{country.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Travel Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Reason for Travel</label>
            <Select value={formData.travel_reason} onValueChange={(value) => handleInputChange("travel_reason", value)}>
              <SelectTrigger className="bg-gray-50 border-gray-200 rounded-xl h-12 focus:bg-white focus:border-gray-300">
                <SelectValue placeholder="Select your travel reason" />
              </SelectTrigger>
              <SelectContent>
                {travelReasons.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-white font-medium rounded-xl hover:opacity-90 transition-opacity mt-6"
            style={{ backgroundColor: "#FA9937" }}
          >
            {loading ? "Saving..." : "Complete Profile"}
          </Button>

          {/* Skip Button */}
          <Button
            type="button"
            variant="outline"
            onClick={onSkip}
            className="w-full h-12 font-medium rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
          >
            Skip for now
          </Button>
        </form>
      </div>
    </div>
  )
}
