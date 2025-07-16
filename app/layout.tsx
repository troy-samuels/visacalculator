import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Schengen Visa Calculator",
  description: "Track your Schengen visa days and calculate remaining time",
}

// Force dynamic rendering to bypass cache
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cacheBustTime = Date.now()
  
  return (
    <html lang="en">
      <head>
        <meta name="cache-control" content="no-cache, no-store, must-revalidate" />
        <meta name="pragma" content="no-cache" />
        <meta name="expires" content="0" />
        <meta name="x-cache-bust" content={`ENHANCED-CALENDAR-${cacheBustTime}`} />
        <meta name="x-deployment" content="FORCE-REFRESH-2025-01-15" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
