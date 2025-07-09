"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, Mail, Share2, ExternalLink, MapPin, Calendar, Heart, Plane, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { LanguageSelector } from "@/components/language-selector"

// Quiz Questions Data
const quizQuestions = [
  {
    id: 1,
    category: "Travel Style",
    question: "What's your ideal European adventure style?",
    options: [
      { id: "A", text: "🏰 Culture & History Explorer", weight: { culture: 3, budget: 0, luxury: 1 } },
      { id: "B", text: "🍷 Food & Wine Enthusiast", weight: { foodie: 3, culture: 1, budget: 0 } },
      { id: "C", text: "🏔️ Outdoor Adventure Seeker", weight: { adventure: 3, budget: 1, active: 2 } },
      { id: "D", text: "🎨 Art & Museums Lover", weight: { culture: 3, art: 2, luxury: 1 } },
      { id: "E", text: "🌃 City Nightlife Explorer", weight: { city: 3, social: 2, budget: 1 } },
      { id: "F", text: "🧘‍♀️ Relaxation & Wellness", weight: { luxury: 3, wellness: 2, romantic: 1 } },
      { id: "G", text: "📸 Instagram-worthy Destinations", weight: { social: 2, trendy: 3, city: 1 } }
    ]
  },
  {
    id: 2,
    category: "Travel Timing", 
    question: "When do you prefer to travel to Europe?",
    options: [
      { id: "A", text: "🌸 Spring (March-May) - Perfect weather, fewer crowds", weight: { budget: 1, culture: 1, romantic: 2 } },
      { id: "B", text: "☀️ Summer (June-August) - Peak season, festivals", weight: { social: 2, adventure: 1, family: 2 } },
      { id: "C", text: "🍂 Fall (September-November) - Beautiful colors, good weather", weight: { culture: 2, foodie: 2, romantic: 1 } },
      { id: "D", text: "❄️ Winter (December-February) - Christmas markets, skiing", weight: { adventure: 2, culture: 1, romantic: 2 } },
      { id: "E", text: "📅 I'm flexible - I follow the best deals", weight: { budget: 3, flexible: 2 } }
    ]
  },
  {
    id: 3,
    category: "Budget Style",
    question: "What's your travel budget philosophy?",
    options: [
      { id: "A", text: "💎 Luxury all the way - money's no object", weight: { luxury: 3, romantic: 1, wellness: 1 } },
      { id: "B", text: "🏨 Mid-range comfort with some splurges", weight: { luxury: 1, culture: 1, balance: 2 } },
      { id: "C", text: "💰 Budget-conscious but comfortable", weight: { budget: 2, practical: 2 } },
      { id: "D", text: "🎒 Shoestring budget - every euro counts", weight: { budget: 3, adventure: 1, social: 1 } }
    ]
  },
  {
    id: 4,
    category: "Accommodation",
    question: "Where do you prefer to stay in Europe?",
    options: [
      { id: "A", text: "🏨 Luxury hotels in city centers", weight: { luxury: 3, city: 2, comfort: 2 } },
      { id: "B", text: "🏘️ Boutique hotels in local neighborhoods", weight: { culture: 2, authentic: 3, balance: 1 } },
      { id: "C", text: "🏠 Vacation rentals/Airbnb", weight: { budget: 1, family: 2, practical: 2 } },
      { id: "D", text: "🏰 Historic properties (castles, monasteries)", weight: { culture: 3, romantic: 2, unique: 3 } },
      { id: "E", text: "🚂 Unique stays (houseboats, treehouses)", weight: { adventure: 2, unique: 3, social: 1 } },
      { id: "F", text: "🏕️ Hostels for meeting people", weight: { budget: 3, social: 3, adventure: 1 } }
    ]
  },
  {
    id: 5,
    category: "Travel Companions",
    question: "Who do you usually travel with?",
    options: [
      { id: "A", text: "✈️ Solo adventurer", weight: { adventure: 2, culture: 1, independent: 3 } },
      { id: "B", text: "💑 Partner/spouse", weight: { romantic: 3, luxury: 1, intimate: 2 } },
      { id: "C", text: "👨‍👩‍👧‍👦 Family with kids", weight: { family: 3, practical: 2, safe: 2 } },
      { id: "D", text: "👫 Group of friends", weight: { social: 3, adventure: 1, party: 2 } },
      { id: "E", text: "🏢 Business/work trips", weight: { practical: 3, efficient: 2, luxury: 1 } },
      { id: "F", text: "👥 Organized tour groups", weight: { culture: 2, safe: 2, guided: 3 } }
    ]
  },
  {
    id: 6,
    category: "Transportation",
    question: "How do you prefer getting around Europe?",
    options: [
      { id: "A", text: "🚄 High-speed trains between cities", weight: { culture: 1, scenic: 2, comfort: 2 } },
      { id: "B", text: "✈️ Budget flights for efficiency", weight: { budget: 2, efficient: 3, practical: 1 } },
      { id: "C", text: "🚗 Rental car for flexibility", weight: { adventure: 2, independent: 3, flexible: 2 } },
      { id: "D", text: "🚌 Bus tours and public transport", weight: { budget: 3, guided: 2, social: 1 } },
      { id: "E", text: "🚢 River cruises and ferries", weight: { luxury: 2, scenic: 3, romantic: 2 } },
      { id: "F", text: "🚶‍♀️ Walking and cycling", weight: { adventure: 3, active: 3, eco: 2 } }
    ]
  },
  {
    id: 7,
    category: "Cultural Interests",
    question: "What draws you most to European destinations?",
    options: [
      { id: "A", text: "🏛️ Ancient history and archaeology", weight: { culture: 3, educational: 2, guided: 1 } },
      { id: "B", text: "🎨 Art galleries and museums", weight: { culture: 3, art: 3, sophisticated: 2 } },
      { id: "C", text: "🏰 Medieval castles and architecture", weight: { culture: 2, romantic: 2, historic: 3 } },
      { id: "D", text: "🎭 Theater, music, and festivals", weight: { culture: 2, social: 2, artistic: 3 } },
      { id: "E", text: "🍷 Local food and wine culture", weight: { foodie: 3, culture: 1, social: 1 } },
      { id: "F", text: "🏞️ Natural landscapes and national parks", weight: { adventure: 3, nature: 3, active: 2 } }
    ]
  },
  {
    id: 8,
    category: "Schengen Knowledge",
    question: "How familiar are you with European visa rules?",
    options: [
      { id: "A", text: "🎓 Expert - I track my days religiously", weight: { experienced: 3, organized: 2, frequent: 3 } },
      { id: "B", text: "📚 Somewhat familiar - I know the basics", weight: { experienced: 1, practical: 2, moderate: 2 } },
      { id: "C", text: "😵 Confused - I never really understood it", weight: { beginner: 2, needs_help: 3, cautious: 1 } },
      { id: "D", text: "🤔 First timer - what's the 90/180 rule?", weight: { beginner: 3, first_timer: 3, needs_help: 2 } }
    ]
  },
  {
    id: 9,
    category: "Future Plans",
    question: "What's your next European travel goal?",
    options: [
      { id: "A", text: "🏃‍♀️ Planning a trip in the next 3 months", weight: { urgent: 3, high_intent: 3, immediate: 3 } },
      { id: "B", text: "📅 Considering travel in 6-12 months", weight: { planning: 2, moderate_intent: 2, organized: 1 } },
      { id: "C", text: "💭 Dreaming of future adventures (1+ years)", weight: { dreaming: 3, inspiration: 2, long_term: 2 } },
      { id: "D", text: "🏠 Currently living/traveling in Europe", weight: { experienced: 3, local: 3, frequent: 2 } }
    ]
  }
]

// Personality Types based on scoring
const personalityTypes = {
  "culture-connoisseur": {
    title: "The Culture Connoisseur",
    emoji: "🏛️",
    description: "You live for Europe's rich cultural heritage, seeking deep historical connections and artistic experiences.",
    destinations: ["Rome", "Paris", "Vienna", "Florence", "Prague"],
    traits: ["Art lover", "History buff", "Museum enthusiast", "Cultural immersion"],
    color: "bg-purple-100 border-purple-300 text-purple-900"
  },
  "foodie-explorer": {
    title: "The Foodie Explorer", 
    emoji: "🍷",
    description: "Your European adventure is a culinary journey through flavors, wines, and gastronomic traditions.",
    destinations: ["Lyon", "Barcelona", "Bologna", "Tuscany", "Porto"],
    traits: ["Culinary curious", "Wine enthusiast", "Local cuisine", "Food markets"],
    color: "bg-orange-100 border-orange-300 text-orange-900"
  },
  "adventure-seeker": {
    title: "The Adventure Seeker",
    emoji: "🏔️", 
    description: "Europe's landscapes are your playground - from Alpine peaks to coastal trails.",
    destinations: ["Swiss Alps", "Norwegian Fjords", "Austrian Tyrol", "Scottish Highlands"],
    traits: ["Outdoor enthusiast", "Active traveler", "Nature lover", "Thrill seeker"],
    color: "bg-green-100 border-green-300 text-green-900"
  },
  "city-explorer": {
    title: "The City Explorer",
    emoji: "🌃",
    description: "Urban energy fuels your travels - from bustling markets to vibrant nightlife scenes.",
    destinations: ["Berlin", "Amsterdam", "Barcelona", "Prague", "Budapest"],
    traits: ["Urban lifestyle", "Nightlife lover", "Social butterfly", "City culture"],
    color: "bg-blue-100 border-blue-300 text-blue-900"
  },
  "luxury-wanderer": {
    title: "The Luxury Wanderer",
    emoji: "💎",
    description: "You appreciate Europe's finer things - elegant accommodations, gourmet dining, and premium experiences.",
    destinations: ["Monaco", "Swiss Riviera", "Tuscany", "French Riviera", "Austrian Alps"],
    traits: ["Luxury seeker", "Fine dining", "Premium comfort", "Exclusive experiences"],
    color: "bg-yellow-100 border-yellow-300 text-yellow-900"
  },
  "budget-backpacker": {
    title: "The Smart Backpacker",
    emoji: "🎒",
    description: "You've mastered the art of European travel on a budget without sacrificing amazing experiences.",
    destinations: ["Eastern Europe", "Portugal", "Greece", "Czech Republic", "Poland"],
    traits: ["Budget conscious", "Value seeker", "Adventure spirit", "Social traveler"],
    color: "bg-emerald-100 border-emerald-300 text-emerald-900"
  },
  "romantic-wanderer": {
    title: "The Romantic Wanderer",
    emoji: "💕",
    description: "Europe's most enchanting destinations call to your romantic soul - perfect for couples' getaways.",
    destinations: ["Paris", "Venice", "Santorini", "Prague", "Bruges"],
    traits: ["Romance seeker", "Intimate settings", "Scenic beauty", "Couple experiences"],
    color: "bg-pink-100 border-pink-300 text-pink-900"
  },
  "family-adventurer": {
    title: "The Family Adventurer", 
    emoji: "👨‍👩‍👧‍👦",
    description: "Creating magical European memories with your family is your priority - safe, fun, and educational.",
    destinations: ["Netherlands", "Switzerland", "Germany", "Denmark", "Austria"],
    traits: ["Family-friendly", "Educational travel", "Safe destinations", "Kid activities"],
    color: "bg-indigo-100 border-indigo-300 text-indigo-900"
  }
}

export default function TravelQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [showResults, setShowResults] = useState(false)
  const [personalityType, setPersonalityType] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [emailCaptured, setEmailCaptured] = useState(false)
  const [scores, setScores] = useState<Record<string, number>>({})

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100

  const handleAnswer = (questionId: number, optionId: string) => {
    setAnswers({ ...answers, [questionId]: optionId })
  }

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      calculateResults()
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateResults = () => {
    const weights: Record<string, number> = {}
    
    // Calculate weighted scores based on answers
    Object.entries(answers).forEach(([questionId, optionId]) => {
      const question = quizQuestions.find(q => q.id === parseInt(questionId))
      const option = question?.options.find(o => o.id === optionId)
      
      if (option?.weight) {
        Object.entries(option.weight).forEach(([trait, value]) => {
          weights[trait] = (weights[trait] || 0) + value
        })
      }
    })

    setScores(weights)

    // Determine personality type based on highest scoring traits
    let resultType = "culture-connoisseur" // default
    
    if (weights.luxury >= 6) resultType = "luxury-wanderer"
    else if (weights.budget >= 6) resultType = "budget-backpacker"  
    else if (weights.foodie >= 6) resultType = "foodie-explorer"
    else if (weights.adventure >= 6) resultType = "adventure-seeker"
    else if (weights.city >= 6) resultType = "city-explorer"
    else if (weights.romantic >= 6) resultType = "romantic-wanderer"
    else if (weights.family >= 6) resultType = "family-adventurer"
    else if (weights.culture >= 6) resultType = "culture-connoisseur"

    setPersonalityType(resultType)
    setShowResults(true)
  }

  const handleEmailCapture = () => {
    if (email && email.includes('@')) {
      setEmailCaptured(true)
      // In real implementation, send email to marketing platform
      console.log("Email captured:", email)
    }
  }

  const shareResults = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My European Travel Personality',
        text: `I'm ${personalityTypes[personalityType as keyof typeof personalityTypes]?.title}! What's your European travel personality?`,
        url: window.location.href
      })
    }
  }

  const currentQ = quizQuestions[currentQuestion]
  const currentAnswer = answers[currentQ?.id]

  if (showResults) {
    const personality = personalityTypes[personalityType as keyof typeof personalityTypes]
    
    return (
      <div className="min-h-screen font-body" style={{ backgroundColor: "#F4F2ED" }}>
        {/* Header */}
        <header className="shadow-sm border-b border-gray-200" style={{ backgroundColor: "#F4F2ED" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Home</span>
                  </Button>
                </Link>
                <h1 className="text-xl font-semibold font-brand text-gray-900">Travel Quiz Results</h1>
              </div>
              <div className="flex items-center space-x-4">
                <LanguageSelector />
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
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-ui px-4 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>🧭</span>
                    <span>Travel Quiz</span>
                  </Link>
                  <Link 
                    href="/destination-checker" 
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-ui px-4 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>🌍</span>
                    <span>Destinations</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Results */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{personality?.emoji}</div>
            <h1 className="text-3xl font-bold font-display text-gray-900 mb-4">
              You're {personality?.title}!
            </h1>
            <p className="text-lg text-gray-600 font-body max-w-2xl mx-auto">
              {personality?.description}
            </p>
          </div>

          {/* Personality Card */}
          <Card className={`mb-8 ${personality?.color}`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 font-brand">
                <span className="text-2xl">{personality?.emoji}</span>
                <span>{personality?.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 font-ui">Your Travel Traits</h4>
                  <div className="flex flex-wrap gap-2">
                    {personality?.traits.map((trait, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 font-ui">Perfect Destinations for You</h4>
                  <div className="flex flex-wrap gap-2">
                    {personality?.destinations.map((dest, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {dest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Capture */}
          {!emailCaptured ? (
            <Card className="mb-8 bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-center font-brand">Get Your Personalized Travel Guide</CardTitle>
                <CardDescription className="text-center">
                  Receive a detailed destination guide, travel tips, and exclusive deals tailored to your personality type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleEmailCapture} className="font-ui">
                    <Mail className="h-4 w-4 mr-2" />
                    Get My Guide
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8 bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <h3 className="font-semibold text-green-900 mb-2">Check Your Email!</h3>
                  <p className="text-green-700 text-sm">
                    Your personalized travel guide is on its way to {email}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Booking Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 font-brand">
                  <Plane className="h-5 w-5" />
                  <span>Find Flights</span>
                </CardTitle>
                <CardDescription>
                  Discover the best deals to your recommended destinations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full font-ui" style={{ backgroundColor: "#FA9937" }}>
                  Search Flights
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 font-brand">
                  <Heart className="h-5 w-5" />
                  <span>Book Accommodation</span>
                </CardTitle>
                <CardDescription>
                  Find the perfect places to stay that match your travel style
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full font-ui">
                  Find Hotels
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Share Results */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-4 font-brand">Share Your Results</h3>
                <div className="flex justify-center space-x-4">
                  <Button onClick={shareResults} variant="outline" className="font-ui">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Link href="/travel-quiz">
                    <Button variant="outline" className="font-ui">
                      Retake Quiz
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button className="font-ui" style={{ backgroundColor: "#FA9937" }}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Plan Your Trip
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-body" style={{ backgroundColor: "#F4F2ED" }}>
      {/* Header */}
      <header className="shadow-sm border-b border-gray-200" style={{ backgroundColor: "#F4F2ED" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Home</span>
                </Button>
              </Link>
              <h1 className="text-xl font-semibold font-brand text-gray-900">European Travel Personality Quiz</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
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
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-ui px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>🧭</span>
                  <span>Travel Quiz</span>
                </Link>
                <Link 
                  href="/destination-checker" 
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-ui px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>🌍</span>
                  <span>Destinations</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600 font-ui">
              Question {currentQuestion + 1} of {quizQuestions.length}
            </span>
            <span className="text-sm font-medium text-gray-600 font-ui">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <Card className="mb-8">
          <CardHeader>
            <div className="text-center">
              <Badge variant="secondary" className="mb-4 font-ui">
                {currentQ?.category}
              </Badge>
              <CardTitle className="text-xl font-bold font-brand text-gray-900">
                {currentQ?.question}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQ?.options.map((option) => (
                <Button
                  key={option.id}
                  variant={currentAnswer === option.id ? "default" : "outline"}
                  className={`w-full text-left justify-start p-4 h-auto font-ui ${
                    currentAnswer === option.id ? "bg-blue-600 text-white" : ""
                  }`}
                  onClick={() => handleAnswer(currentQ.id, option.id)}
                >
                  <span className="text-sm">{option.text}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
            className="font-ui"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={nextQuestion}
            disabled={!currentAnswer}
            className="font-ui"
            style={{ backgroundColor: currentAnswer ? "#FA9937" : undefined }}
          >
            {currentQuestion === quizQuestions.length - 1 ? "See Results" : "Next"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
} 