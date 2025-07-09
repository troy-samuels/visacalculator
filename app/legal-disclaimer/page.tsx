"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/language-selector"

export default function LegalDisclaimer() {
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
              <h1 className="text-xl font-semibold font-brand text-gray-900">Legal Disclaimer</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h1 className="text-3xl font-bold font-display text-gray-900 mb-8">Legal Disclaimer</h1>
          
          <div className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Information Accuracy</h2>
              <p className="text-gray-700 leading-relaxed">
                The Schengen Visa Calculator provides estimated calculations based on the information you provide. 
                While we strive to ensure accuracy, this tool is for informational purposes only and should not be 
                considered as official legal advice or definitive visa guidance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">No Legal Advice</h2>
              <p className="text-gray-700 leading-relaxed">
                This website does not provide legal advice. The information and calculations provided are general 
                in nature and may not apply to your specific circumstances. For official visa requirements and 
                regulations, please consult with relevant government authorities or qualified immigration professionals.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">User Responsibility</h2>
              <p className="text-gray-700 leading-relaxed">
                Users are solely responsible for ensuring compliance with all applicable visa regulations and 
                requirements. It is your responsibility to verify current visa rules, entry requirements, and 
                any changes to immigration policies that may affect your travel plans.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                We shall not be liable for any direct, indirect, incidental, special, or consequential damages 
                arising from your use of this website or reliance on its calculations. This includes but is not 
                limited to damages for loss of profits, goodwill, use, data, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Third-Party Links</h2>
              <p className="text-gray-700 leading-relaxed">
                This website may contain links to third-party websites for booking flights, accommodations, or 
                other travel services. We are not responsible for the content, accuracy, or practices of these 
                external sites. Use of affiliate links helps support our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Changes to Regulations</h2>
              <p className="text-gray-700 leading-relaxed">
                Visa regulations and requirements can change frequently. While we attempt to keep our information 
                current, we cannot guarantee that all information reflects the most recent changes. Always verify 
                current requirements with official government sources before traveling.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about this disclaimer or our service, please contact us through our 
                website's contact form. For official visa information, contact the relevant embassy or consulate.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 