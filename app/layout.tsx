import type { Metadata } from 'next'
import { Inter, Poppins, Onest, Playfair_Display, Open_Sans } from 'next/font/google'
import './globals.css'

// Load fonts with Next.js optimization
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

const onest = Onest({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-onest',
})

const playfair = Playfair_Display({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-playfair',
})

const openSans = Open_Sans({ 
  subsets: ['latin'],
  variable: '--font-open-sans',
})

export const metadata: Metadata = {
  title: 'Schengen Travel Assistant',
  description: 'Plan smarter, travel easier with comprehensive Schengen visa calculations',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} ${onest.variable} ${playfair.variable} ${openSans.variable}`}>
        {children}
      </body>
    </html>
  )
}
