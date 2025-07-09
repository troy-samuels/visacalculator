"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Search, MapPin, Plane, Hotel, Calendar, ExternalLink, Globe, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { LanguageSelector } from "@/components/language-selector"

// Sample data - in production this would come from a proper API
const nationalityData = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
]

const destinationData = {
  // Sample visa-free destinations by nationality
  US: [
    { country: "Germany", flag: "🇩🇪", days: 90, region: "Western Europe", highlights: ["Berlin", "Munich", "Cologne"] },
    { country: "France", flag: "🇫🇷", days: 90, region: "Western Europe", highlights: ["Paris", "Lyon", "Nice"] },
    { country: "Italy", flag: "🇮🇹", days: 90, region: "Southern Europe", highlights: ["Rome", "Florence", "Venice"] },
    { country: "Spain", flag: "🇪🇸", days: 90, region: "Southern Europe", highlights: ["Madrid", "Barcelona", "Seville"] },
    { country: "Netherlands", flag: "🇳🇱", days: 90, region: "Western Europe", highlights: ["Amsterdam", "Rotterdam", "Utrecht"] },
    { country: "Austria", flag: "🇦🇹", days: 90, region: "Central Europe", highlights: ["Vienna", "Salzburg", "Innsbruck"] },
    { country: "Switzerland", flag: "🇨🇭", days: 90, region: "Central Europe", highlights: ["Zurich", "Geneva", "Bern"] },
    { country: "Portugal", flag: "🇵🇹", days: 90, region: "Southern Europe", highlights: ["Lisbon", "Porto", "Madeira"] },
    { country: "Greece", flag: "🇬🇷", days: 90, region: "Southern Europe", highlights: ["Athens", "Santorini", "Mykonos"] },
    { country: "Czech Republic", flag: "🇨🇿", days: 90, region: "Central Europe", highlights: ["Prague", "Brno", "Cesky Krumlov"] },
  ],
  GB: [
    { country: "Germany", flag: "🇩🇪", days: 90, region: "Western Europe", highlights: ["Berlin", "Munich", "Cologne"] },
    { country: "France", flag: "🇫🇷", days: 90, region: "Western Europe", highlights: ["Paris", "Lyon", "Nice"] },
    { country: "Italy", flag: "🇮🇹", days: 90, region: "Southern Europe", highlights: ["Rome", "Florence", "Venice"] },
    { country: "Spain", flag: "🇪🇸", days: 90, region: "Southern Europe", highlights: ["Madrid", "Barcelona", "Seville"] },
    { country: "Netherlands", flag: "🇳🇱", days: 90, region: "Western Europe", highlights: ["Amsterdam", "Rotterdam", "Utrecht"] },
    { country: "Portugal", flag: "🇵🇹", days: 90, region: "Southern Europe", highlights: ["Lisbon", "Porto", "Madeira"] },
    { country: "Greece", flag: "🇬🇷", days: 90, region: "Southern Europe", highlights: ["Athens", "Santorini", "Mykonos"] },
    { country: "Austria", flag: "🇦🇹", days: 90, region: "Central Europe", highlights: ["Vienna", "Salzburg", "Innsbruck"] },
  ],
  // Add more nationalities as needed
}

interface Destination {
  country: string
  flag: string
  days: number
  region: string
  highlights: string[]
}

export default function DestinationChecker() {
  const [selectedNationality, setSelectedNationality] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [showResults, setShowResults] = useState<boolean>(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)

  const handleNationalityChange = (nationality: string) => {
    setSelectedNationality(nationality)
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const data = destinationData[nationality as keyof typeof destinationData] || []
      setDestinations(data)
      setLoading(false)
      setShowResults(true)
    }, 1000)
  }

  const filteredDestinations = destinations.filter(dest =>
    dest.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dest.region.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedCountry = nationalityData.find(n => n.code === selectedNationality)

  return (
    <div className="min-h-screen font-body" style={{ backgroundColor: "#F4F2ED" }}>
      {/* Header */}
      <header className="shadow-sm border-b border-gray-200" style={{ backgroundColor: "#F4F2ED" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Home</span>
                </Button>
              </Link>
              <h1 className="text-xl font-semibold font-brand text-gray-900">Destination Checker</h1>
              <nav className="hidden md:flex space-x-6">
                <Link href="/travel-quiz" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-ui">
                  🧭 Travel Quiz
                </Link>
                <Link href="/destination-checker" className="text-blue-600 font-semibold transition-colors duration-200 font-ui">
                  🌍 Destinations
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <div className="hidden md:flex">
                <Link href="/login">
                  <Button className="bg-black hover:bg-gray-800 text-white transition-colors duration-200 px-6 py-2 rounded-full font-ui">
                    Login
                  </Button>
                </Link>
              </div>
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white py-4">
              <div className="flex flex-col space-y-4">
                <Link 
                  href="/travel-quiz" 
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-ui px-4 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>🧭</span>
                  <span>Travel Quiz</span>
                </Link>
                <Link 
                  href="/destination-checker" 
                  className="flex items-center space-x-2 text-blue-600 font-semibold transition-colors duration-200 font-ui px-4 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>🌍</span>
                  <span>Destinations</span>
                </Link>
                <div className="px-4">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-black hover:bg-gray-800 text-white transition-colors duration-200 py-2 rounded-full font-ui">
                      Login
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 mb-4">
            Discover Your Travel Possibilities
          </h1>
          <p className="text-lg text-gray-600 font-body max-w-2xl mx-auto">
            Select your nationality to see all the amazing destinations you can visit visa-free in the Schengen Area
          </p>
        </div>

        {/* Nationality Selector */}
        <div className="max-w-md mx-auto mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center font-brand">Select Your Nationality</CardTitle>
              <CardDescription className="text-center">
                Choose your passport country to see available destinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedNationality} onValueChange={handleNationalityChange}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="🌍 Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {nationalityData.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{country.flag}</span>
                        <span>{country.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-body">Finding your travel destinations...</p>
          </div>
        )}

        {/* Results Section */}
        {showResults && !loading && (
          <div className="space-y-8">
            {/* Results Header */}
            <div className="text-center">
              <h2 className="text-2xl font-bold font-brand text-gray-900 mb-2">
                Great News! {selectedCountry?.flag} {selectedCountry?.name} passport holders can visit
              </h2>
              <div className="text-3xl font-bold text-blue-600 mb-4">
                {destinations.length} Schengen Countries Visa-Free
              </div>
              <Badge variant="secondary" className="text-sm font-ui">
                Up to 90 days within any 180-day period
              </Badge>
            </div>

            {/* Search Filter */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search destinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Destinations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDestinations.map((destination, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{destination.flag}</span>
                        <div>
                          <CardTitle className="text-lg font-brand">{destination.country}</CardTitle>
                          <CardDescription>{destination.region}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-ui">
                        {destination.days} days
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1 font-ui">Popular Cities</h4>
                        <div className="flex flex-wrap gap-1">
                          {destination.highlights.map((city, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {city}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button variant="outline" size="sm" className="font-ui">
                          <Plane className="h-3 w-3 mr-1" />
                          Flights
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                        <Button variant="outline" size="sm" className="font-ui">
                          <Hotel className="h-3 w-3 mr-1" />
                          Hotels
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Call to Action */}
            <div className="text-center pt-8 border-t">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-xl font-bold font-brand text-gray-900 mb-4">
                  Ready to Plan Your Perfect European Adventure?
                </h3>
                <p className="text-gray-600 font-body mb-6">
                  Use our advanced Schengen calculator to plan multiple trips and stay compliant with the 90/180 day rule
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/">
                    <Button 
                      className="text-white font-ui font-medium px-8 py-3 rounded-lg hover:opacity-90 transition-all duration-200"
                      style={{ backgroundColor: "#FA9937" }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Plan Your Trips
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="outline" className="font-ui font-medium px-8 py-3 rounded-lg">
                      Save Your Results
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Getting Started */}
        {!showResults && !loading && (
          <div className="text-center py-12">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold font-brand text-gray-900 mb-4">
                How It Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">1️⃣</span>
                  </div>
                  <h4 className="font-semibold font-ui mb-2">Select Nationality</h4>
                  <p className="text-sm text-gray-600 font-body">Choose your passport country</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">2️⃣</span>
                  </div>
                  <h4 className="font-semibold font-ui mb-2">View Destinations</h4>
                  <p className="text-sm text-gray-600 font-body">See all visa-free countries</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">3️⃣</span>
                  </div>
                  <h4 className="font-semibold font-ui mb-2">Start Planning</h4>
                  <p className="text-sm text-gray-600 font-body">Book flights and accommodation</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 