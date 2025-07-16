import { NextResponse } from 'next/server'

export async function GET() {
  const timestamp = Date.now()
  const deploymentTime = new Date().toISOString()
  
  return NextResponse.json(
    { 
      status: '🚀 ENHANCED CALENDAR LIVE',
      timestamp,
      deploymentTime,
      message: 'Enhanced calendar with visual feedback deployed successfully',
      deployment: 'ENHANCED-CALENDAR-2025-01-16-01:37',
      version: 'v4.0.0-ENHANCED-CALENDAR',
      calendarFeatures: {
        buttonSize: '48px x 48px for better clickability',
        selectedDates: 'Dark slate-800 background with white text',
        rangeMiddle: 'Light gray background for range indication',
        hoverEffects: 'Smooth transitions and visual feedback',
        borders: '2px borders around selected dates',
        shadows: 'Box shadows for depth'
      },
      testSteps: [
        '1. Select a country from the dropdown',
        '2. Click the "Select dates" button', 
        '3. Click a start date - should see dark background instantly',
        '4. Click an end date - both should be dark with white text',
        '5. Middle dates should show light gray background'
      ],
      success: true
    },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Enhanced-Calendar': 'DEPLOYED',
        'X-Timestamp': timestamp.toString()
      },
    }
  )
} 