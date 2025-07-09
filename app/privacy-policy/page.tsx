"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/language-selector"

export default function PrivacyPolicy() {
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
              <h1 className="text-xl font-semibold font-brand text-gray-900">Privacy Policy</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h1 className="text-3xl font-bold font-display text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed">
                We collect information you provide directly to us, such as when you create an account, 
                use our calculator, take our travel quiz, or contact us for support. This may include 
                your email address, travel dates, destination countries, and quiz responses.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Provide and improve our Schengen calculator services</li>
                <li>Send you personalized travel recommendations and guides</li>
                <li>Communicate with you about our services</li>
                <li>Analyze usage patterns to improve our website</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Information Sharing</h2>
              <p className="text-gray-700 leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except as described in this policy. We may share information with 
                trusted service providers who assist us in operating our website and conducting our business.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience on our website. 
                This includes storing your language preferences, remembering your calculator inputs, and 
                analyzing website usage patterns. You can control cookie settings through your browser.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. However, no method of 
                transmission over the internet or electronic storage is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Under GDPR and other applicable privacy laws, you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Access your personal data</li>
                <li>Correct inaccurate personal data</li>
                <li>Delete your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed">
                Our website may contain links to third-party services for booking flights, accommodations, 
                or other travel services. These services have their own privacy policies, and we are not 
                responsible for their privacy practices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Updates to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any changes 
                by posting the new policy on this page and updating the "Last updated" date below.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this privacy policy or our data practices, please 
                contact us through our website's contact form.
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