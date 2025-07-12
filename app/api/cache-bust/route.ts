export const revalidate = 0

export async function GET() {
  return new Response(JSON.stringify({
    timestamp: new Date().toISOString(),
    message: "🚨 NUCLEAR DEPLOYMENT - Complete fresh rebuild with working folder code",
    deployment: "2025-07-12-21-30-NUCLEAR-OPTION", 
    version: "v3.0.0-WORKING-FOLDER-MATCH",
    cacheBust: Date.now()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    }
  })
} 