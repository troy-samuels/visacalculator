import { NextResponse } from 'next/server'

export async function GET() {
  const timestamp = Date.now()
  const deploymentTime = new Date().toISOString()
  
  return NextResponse.json(
    { 
      status: 'LIVE',
      timestamp,
      deploymentTime,
      message: '✅ ENHANCED CALENDAR IS DEPLOYED',
      deployment: 'PRODUCTION-ENHANCED-CALENDAR-2025-01-16',
      version: 'v4.0.0-ENHANCED-CALENDAR-VISUAL-FEEDBACK',
      features: {
        calendarButtons: '48px for better visibility',
        selectedDates: 'Dark slate-800 background with white text',
        rangeIndication: 'Clear visual feedback',
        hoverStates: 'Enhanced transitions',
        visualFeedback: 'Improved date selection indicators'
      },
      testInstructions: [
        '1. Select a country from dropdown',
        '2. Click date range button', 
        '3. Click first date - should show dark slate-800 background',
        '4. Click second date - both dates should be dark with white text',
        '5. Middle dates should show light gray background'
      ]
    },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Deployment-Check': `ENHANCED-CALENDAR-${timestamp}`,
        'X-Features-Deployed': 'true'
      },
    }
  )
} 