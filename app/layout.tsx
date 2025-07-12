import { Inter } from "next/font/google"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"
import { CacheCheck } from "./cache-check"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Schengen Visa Calculator",
  description: "Calculate your Schengen visa days remaining",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <CacheCheck />
          <div id="root">{children}</div>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  )
}
