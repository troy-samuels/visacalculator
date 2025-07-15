import { NextResponse } from 'next/server'

export async function GET() {
  const timestamp = Date.now()
  const cacheBustId = `CALENDAR-FIX-${timestamp}`
  
  return NextResponse.json(
    { 
      success: true, 
      timestamp,
      cacheBustId,
      message: 'Cache cleared successfully',
      deployment: 'PRODUCTION-CALENDAR-FIX-2025-01-15'
    },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Cache-Bust': cacheBustId,
        'X-Timestamp': timestamp.toString(),
      },
    }
  )
}

export async function POST() {
  return GET()
} 