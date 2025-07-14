"use client"

import { useState, useEffect } from "react"
import { X, Mail, User, Globe, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useAnalytics } from "@/lib/hooks/useAnalytics"
import { useRouter } from "next/navigation"

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const countries = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "OTHER", name: "Other", flag: "🌍" },
]

export default function SignupModal({ isOpen, onClose, onSuccess }: SignupModalProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    homeCountry: "",
  })

  const supabase = createClient()
  const { trackSignup } = useAnalytics()
  const router = useRouter()

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        homeCountry: "",
      })
      setMessage(null)
    }
  }, [isOpen])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Validation
    if (!formData.firstName.trim()) {
      setMessage({ type: "error", text: "First name is required" })
      setLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setMessage({ type: "error", text: "Email is required" })
      setLoading(false)
      return
    }

    if (!formData.homeCountry) {
      setMessage({ type: "error", text: "Home country is required" })
      setLoading(false)
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: "error", text: "Please enter a valid email address" })
      setLoading(false)
      return
    }

    try {
      // Generate a temporary password for the user
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            home_country: formData.homeCountry,
          },
        },
      })

      if (error) {
        if (error.message.includes("already registered")) {
          setMessage({ type: "error", text: "This email is already registered. Please try logging in instead." })
        } else {
          setMessage({ type: "error", text: error.message })
        }
      } else {
        // Track successful signup (anonymized)
        trackSignup(formData.homeCountry)
        
        // Success - user created and logged in
        setMessage({
          type: "success",
          text: "Account created successfully! You can now save your visa calculations.",
        })
        
        // Call success callback after a short delay
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Modal content - centered on screen */}
      <div className="relative z-10 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden" style={{ backgroundColor: "#F4F2ED" }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: "#F4F2ED" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Save Your Calculations</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-600 hover:text-gray-900"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-gray-600 text-sm mt-1">
            Create an account to save and access your visa calculations anytime
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="John"
                  className="pl-10 bg-white border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Doe"
                className="bg-white border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="john@example.com"
                className="pl-10 bg-white border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                disabled={loading}
              />
            </div>
          </div>

          {/* Home Country */}
          <div>
            <label htmlFor="homeCountry" className="block text-sm font-medium text-gray-700 mb-1">
              Home Country *
            </label>
            <Select value={formData.homeCountry} onValueChange={(value) => handleInputChange("homeCountry", value)} disabled={loading}>
              <SelectTrigger className="w-full bg-white border-gray-300 focus:border-gray-400 focus:ring-gray-400">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="Select your home country" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.type === "error" 
                ? "bg-red-50 text-red-800 border border-red-200" 
                : "bg-green-50 text-green-800 border border-green-200"
            }`}>
              {message.text}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              disabled={loading}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            >
              Skip for now
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#FA9937" }}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-2">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </div>
        </form>
      </div>
    </div>
  )
} 