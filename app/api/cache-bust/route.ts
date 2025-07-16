import { NextResponse } from 'next/server'

export async function GET() {
  const timestamp = Date.now()
  const cacheBustId = `ENHANCED-CALENDAR-${timestamp}`
  
  return NextResponse.json(
    { 
      success: true, 
      timestamp,
      cacheBustId,
      message: '🚀 ENHANCED CALENDAR DEPLOYMENT - Visual feedback for date selection',
      deployment: 'PRODUCTION-ENHANCED-CALENDAR-2025-01-16',
      version: 'v4.0.0-ENHANCED-CALENDAR-VISUAL-FEEDBACK',
      features: [
        '48px calendar buttons for better visibility',
        'Dark slate-800 selected dates with white text',
        'Clear visual range indication',
        'Enhanced hover states and transitions',
        'Improved date selection feedback'
      ]
    },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'X-Cache-Bust': cacheBustId,
        'X-Timestamp': timestamp.toString(),
        'X-Force-Refresh': 'true',
        'Vary': '*'
      },
    }
  )
}

export async function POST() {
  return GET()
} 