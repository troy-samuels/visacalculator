"use client"

import { useState, useEffect } from "react"
import { X, Shield, Eye, Database, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PrivacyNotice() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already seen the privacy notice
    const hasSeenNotice = localStorage.getItem('privacy-notice-seen')
    if (!hasSeenNotice) {
      // Show after a brief delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('privacy-notice-seen', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6" style={{ backgroundColor: "#F4F2ED" }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Privacy Notice</h3>
          </div>
          <button
            onClick={handleAccept}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-600 hover:text-gray-900"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <Eye className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
            <span>We collect anonymized usage data to improve our service</span>
          </div>
          
          <div className="flex items-start space-x-2">
            <Database className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
            <span>No personal information is linked to analytics data</span>
          </div>
          
          <div className="flex items-start space-x-2">
            <Clock className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
            <span>Data is automatically deleted after 12 months</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-3">
            We're GDPR compliant and you can opt out anytime in your profile settings.
          </p>
          
          <Button
            onClick={handleAccept}
            className="w-full text-white text-sm"
            style={{ backgroundColor: "#FA9937" }}
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  )
} 