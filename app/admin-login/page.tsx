"use client"

import { useState } from "react"
import { Lock, Mail, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/lib/hooks/useAdminAuth"

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [formData, setFormData] = useState({
    email: "admin@schengenvisacalculator.com",
    password: "admin123!",
  })

  const router = useRouter()
  const { adminSignIn } = useAdminAuth()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const success = adminSignIn(formData.email, formData.password)
      
      if (success) {
        setMessage({ type: "success", text: "Admin login successful!" })
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      } else {
        setMessage({ type: "error", text: "Invalid admin credentials" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen font-['Onest',sans-serif] flex items-center justify-center p-4"
      style={{ backgroundColor: "#F4F2ED" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-yellow-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
      </div>

      {/* Modal */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Access</h2>
            <p className="text-gray-600 text-sm mt-2">Login with admin credentials to access dashboard</p>
          </div>

          {/* Admin Credentials Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Admin Credentials:</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <div><strong>Email:</strong> admin@schengenvisacalculator.com</div>
              <div><strong>Password:</strong> admin123!</div>
            </div>
          </div>

          {/* Message display */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleAdminSignIn} className="space-y-4">
            {/* Email field */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Enter admin email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="bg-gray-50 border-gray-200 rounded-xl h-12 pl-12 pr-4 focus:bg-white focus:border-gray-300 transition-colors"
                required
              />
            </div>

            {/* Password field */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter admin password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="bg-gray-50 border-gray-200 rounded-xl h-12 pl-12 pr-12 focus:bg-white focus:border-gray-300 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Sign in button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-white font-medium rounded-xl hover:opacity-90 transition-opacity mt-6"
              style={{ backgroundColor: "#FA9937" }}
            >
              {loading ? "Signing In..." : "Admin Sign In"}
            </Button>

            {/* Back to home */}
            <div className="text-center mt-6">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 hover:underline">
                ← Back to Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 