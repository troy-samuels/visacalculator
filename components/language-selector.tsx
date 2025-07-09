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

  // Detect browser language on mount
  useEffect(() => {
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
  }, [onLanguageChange])

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode)
    localStorage.setItem("preferredLanguage", languageCode)
    setIsOpen(false)
    
    if (onLanguageChange) {
      onLanguageChange(languageCode)
    }

    // Dispatch event for useTranslation hook to listen
    window.dispatchEvent(new CustomEvent("languageChanged", { detail: languageCode }))

    // In a real app, you would trigger language change here
    // For now, we'll just show a console log
    console.log(`Language changed to: ${languageCode}`)
  }

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[0]

  if (compact) {
    // Compact version for mobile/smaller screens
    return (
      <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[120px] h-9">
          <div className="flex items-center space-x-2">
            <span className="text-sm">{currentLanguage.flag}</span>
            <span className="text-sm font-medium">{currentLanguage.code.toUpperCase()}</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center space-x-3">
                <span>{language.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{language.nativeName}</span>
                  <span className="text-xs text-gray-500">{language.name}</span>
                </div>
                {selectedLanguage === language.code && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  // Full version for desktop
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center space-x-2 hover:bg-gray-100 transition-colors duration-200"
        >
          <Globe className="h-4 w-4 text-gray-600" />
          <span className="text-lg">{currentLanguage.flag}</span>
          <span className="text-sm font-medium text-gray-700">
            {currentLanguage.code.toUpperCase()}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3 font-brand">Choose Language</h3>
          <div className="space-y-1">
            {languages.map((language) => (
              <Button
                key={language.code}
                variant="ghost"
                className={`w-full justify-start text-left font-normal ${
                  selectedLanguage === language.code ? "bg-blue-50 text-blue-700" : ""
                }`}
                onClick={() => handleLanguageChange(language.code)}
              >
                <div className="flex items-center space-x-3 w-full">
                  <span className="text-lg">{language.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-xs text-gray-500">{language.name}</div>
                  </div>
                  {selectedLanguage === language.code && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              </Button>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500 text-center">
              Language detected from your browser: {navigator.language}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
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