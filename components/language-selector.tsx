"use client"

import { useState, useEffect } from "react"
import { Globe, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Supported languages for the travel platform
const languages = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", flag: "🇸🇪" },
  { code: "da", name: "Danish", nativeName: "Dansk", flag: "🇩🇰" },
  { code: "no", name: "Norwegian", nativeName: "Norsk", flag: "🇳🇴" },
  { code: "fi", name: "Finnish", nativeName: "Suomi", flag: "🇫🇮" },
]

interface LanguageSelectorProps {
  onLanguageChange?: (language: string) => void
  compact?: boolean
}

export function LanguageSelector({ onLanguageChange, compact = false }: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en")
  const [isOpen, setIsOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Detect browser language on mount
  useEffect(() => {
    // Mark as client-side after hydration
    setIsClient(true)
    
    // Only run client-side code after hydration
    if (typeof window !== 'undefined') {
      const detectLanguage = () => {
        // Check localStorage first
        const savedLanguage = localStorage.getItem("preferredLanguage")
        if (savedLanguage && languages.find(lang => lang.code === savedLanguage)) {
          return savedLanguage
        }

        // Detect from browser
        const browserLang = navigator.language.split("-")[0] // Get language without region
        const supportedLang = languages.find(lang => lang.code === browserLang)
        
        return supportedLang ? supportedLang.code : "en"
      }

      const detectedLanguage = detectLanguage()
      setSelectedLanguage(detectedLanguage)
      
      // Save to localStorage
      localStorage.setItem("preferredLanguage", detectedLanguage)
      
      // Notify parent component
      if (onLanguageChange) {
        onLanguageChange(detectedLanguage)
      }
    }
  }, [onLanguageChange])

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode)
    if (typeof window !== 'undefined') {
      localStorage.setItem("preferredLanguage", languageCode)
    }
    setIsOpen(false)
    
    if (onLanguageChange) {
      onLanguageChange(languageCode)
    }

    // Dispatch event for useTranslation hook to listen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent("languageChanged", { detail: languageCode }))
    }

    // In a real app, you would trigger language change here
    // For now, we'll just show a console log
    console.log(`Language changed to: ${languageCode}`)
  }

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[0]

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 hover:bg-gray-100 transition-colors duration-200"
      >
        <Globe className="h-4 w-4 text-gray-600" />
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-medium text-gray-700">{currentLanguage.name}</span>
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200 ${
                selectedLanguage === language.code ? "bg-blue-50 text-blue-600" : "text-gray-700"
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span className="text-sm font-medium">{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Hook to use current language in components
export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState<string>("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage") || "en"
    setCurrentLanguage(savedLanguage)
  }, [])

  return currentLanguage
} 