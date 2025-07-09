"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/language-selector"

export default function TermsAndConditions() {
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
              <h1 className="text-xl font-semibold font-brand text-gray-900">Terms & Conditions</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h1 className="text-3xl font-bold font-display text-gray-900 mb-8">Terms & Conditions</h1>
          
          <div className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using the Schengen Visa Calculator website, you accept and agree to be 
                bound by these Terms and Conditions. If you do not agree to these terms, please do not 
                use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Service Description</h2>
              <p className="text-gray-700 leading-relaxed">
                Our website provides tools and information to help users calculate their Schengen visa 
                compliance, discover travel destinations, and plan European trips. The service includes 
                calculators, travel quizzes, destination guides, and affiliate recommendations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">User Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By using our service, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Provide accurate information when using our calculators</li>
                <li>Use the service for lawful purposes only</li>
                <li>Respect intellectual property rights</li>
                <li>Not attempt to reverse engineer or copy our systems</li>
                <li>Verify all travel information with official sources</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Accuracy of Information</h2>
              <p className="text-gray-700 leading-relaxed">
                While we strive to provide accurate information, we make no guarantees about the 
                completeness, accuracy, or timeliness of the information on our website. Visa 
                regulations change frequently, and you should always verify current requirements 
                with official government sources.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Affiliate Relationships</h2>
              <p className="text-gray-700 leading-relaxed">
                Our website contains affiliate links to travel booking services. We may receive 
                compensation when you book through these links. This helps support our free service 
                but does not affect the price you pay or influence our recommendations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                All content on this website, including text, graphics, logos, and software, is the 
                property of Schengen Visa Calculator or its content suppliers and is protected by 
                copyright and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                We shall not be liable for any direct, indirect, incidental, special, or consequential 
                damages resulting from your use of our website or reliance on its information. This 
                includes but is not limited to travel disruptions, visa denials, or financial losses.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Account Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                If you create an account, you are responsible for maintaining the confidentiality of 
                your login credentials and for all activities that occur under your account. You agree 
                to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to terminate or suspend your access to our service at any time, 
                without prior notice, for conduct that we believe violates these Terms and Conditions 
                or is harmful to other users or our business.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update these Terms and Conditions from time to time. We will notify you of any 
                changes by posting the new terms on this page and updating the "Last updated" date below. 
                Your continued use of the service after any changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms and Conditions are governed by and construed in accordance with applicable 
                laws. Any disputes arising from these terms or your use of our service will be subject 
                to the jurisdiction of the appropriate courts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-brand text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms and Conditions, please contact us through 
                our website's contact form.
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